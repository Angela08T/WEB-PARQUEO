/* Movimientos.jsx: todos los ingresos, pagos y deudas registrados por los cobradores,
   con filtros (estado, zona, cobrador y placa), paginación de 12 en 12 y la verificación de constancia y GPS de cada registro. */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Card, Pill, Plate, PillEstado, Who, useUI, EASE } from '../components/ui.jsx';
import { COBR, T, ZONAS, esHoy, hhmm, money } from '../data.js';

// Filas por página
const POR = 12;

/* Resultado de la verificación de la constancia en la app (solo pagos con QR) */
export const Constancia = ({ t }) => t.metodo !== 'QR' ? <span className="muted">—</span>
  : !t.verif ? <Pill k="off" dot={false}>Sin verificar</Pill>
  : t.verif.estado === 'ok' ? <Pill k="ok">Verificada</Pill>
  : t.verif.estado === 'revisar' ? <Pill k="yel">Revisar</Pill>
  : <span title={t.verif.motivo}><Pill k="bad">Alerta</Pill></span>;
/* Ubicación del registro: precisión del GPS o distancia a su zona */
export const Gps = ({ p }) => !p ? <span className="muted">Sin GPS</span>
  : p.fuera ? <span className="gps-c bad" title="Registro hecho lejos del tramo asignado">{p.dist} m fuera</span> : <span className="gps-c">±{p.prec} m</span>;

export default function Movimientos(){
  const { toast } = useUI();
  // Filtros activos y página actual; dir = sentido de la animación al pasar de página
  const [f, setF] = useState({ estado:'', zona:'', cobr:'', q:'' });
  const [pag, setPag] = useState(0), [dir, setDir] = useState(1);
  // Al cambiar un filtro se vuelve a la primera página
  const cambiar = (k, v) => { setF(x => ({ ...x, [k]:v })); setPag(0); };
  // Movimientos que cumplen todos los filtros (la placa se compara sin guion)
  const l = useMemo(() => T.filter(t => (!f.estado || t.estado === f.estado) && (f.zona === '' || t.zona === +f.zona) && (f.cobr === '' || t.cobrador === COBR[+f.cobr]) && (!f.q || t.placa.replace('-', '').includes(f.q.replace('-', '')))), [f]);
  const pages = Math.max(1, Math.ceil(l.length / POR)), p = Math.min(pag, pages - 1);
  const ir = n => { setDir(n > p ? 1 : -1); setPag(n); };
  const fecha = d => (esHoy(d) ? 'Hoy' : d.toLocaleDateString('es-PE', { day:'2-digit', month:'short' })) + ' ' + hhmm(d);
  // Totales para los botones de estado de arriba
  const cuenta = { activo:T.filter(t => t.estado === 'activo').length, pagado:T.filter(t => t.estado === 'pagado').length, pendiente:T.filter(t => t.estado === 'pendiente').length };

  return <>
    {/* Botones de estado: también funcionan como filtro; el borde azul se desliza al elegido */}
    <div className="seg-stats">
      {[['', 'Todos', T.length, 'list'], ['activo', 'En parqueo', cuenta.activo, 'car'], ['pagado', 'Pagados', cuenta.pagado, 'check'], ['pendiente', 'No pagaron', cuenta.pendiente, 'alert']].map(([k, t, n, i], idx) =>
        <motion.button key={k} className={'seg' + (f.estado === k ? ' on' : '') + ' s-' + (k || 'all')} onClick={() => cambiar('estado', k)}
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:idx * .05, ease:EASE }} whileHover={{ y:-2 }} whileTap={{ scale:.98 }}>
          <span className="seg-ic"><Icon n={i} size={17} /></span><span><small>{t}</small><b className="tnum">{n}</b></span>
          {f.estado === k && <motion.span layoutId="seg-on" className="seg-ring" transition={{ type:'spring', stiffness:450, damping:34 }} />}
        </motion.button>)}
    </div>
    <Card i={2}>
      {/* Filtros (el de fecha todavía es solo visual en el boceto) y botón de exportar */}
      <div className="filters">
        <div className="field"><label>Fecha</label><select><option>Últimos 7 días</option><option>Hoy</option><option>Ayer</option><option>Este mes</option></select></div>
        <div className="field"><label htmlFor="fZona">Zona</label><select id="fZona" value={f.zona} onChange={e => cambiar('zona', e.target.value)}><option value="">Todas</option>{ZONAS.map(z => <option key={z.id} value={z.id}>{z.n}</option>)}</select></div>
        <div className="field"><label htmlFor="fCob">Cobrador</label><select id="fCob" value={f.cobr} onChange={e => cambiar('cobr', e.target.value)}><option value="">Todos</option>{COBR.map((c, i) => <option key={i} value={i}>{c.nombre}</option>)}</select></div>
        <div className="field"><label htmlFor="fQ">Placa</label><label className="search"><Icon n="search" size={17} /><input id="fQ" placeholder="Buscar placa" value={f.q} onChange={e => cambiar('q', e.target.value.toUpperCase())} /></label></div>
        <motion.button className="btn btn-yel" whileTap={{ scale:.97 }} onClick={() => toast('En el boceto la descarga no está activa')}><Icon n="download" />Exportar Excel</motion.button>
      </div>
      <div className="tbl-w" style={{ borderTop:'1px solid var(--line)' }}><table>
        <thead><tr><th>Placa</th><th>Vehículo</th><th>Zona · espacio</th><th>Entrada</th><th>Salida</th><th>Cobrador</th><th>Estado</th><th>Constancia</th><th>GPS</th><th>N° operación</th><th className="r">Monto</th></tr></thead>
        <AnimatePresence mode="wait" initial={false}>
          {/* Al cambiar filtros o página, la tabla se desliza hacia el lado correspondiente */}
          <motion.tbody key={JSON.stringify(f) + p} initial={{ opacity:0, x:dir * 18 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:dir * -18 }} transition={{ duration:.22, ease:EASE }}>
            {l.slice(p * POR, p * POR + POR).map(t => <tr key={t.id}>
              <td><Plate p={t.placa} /></td><td className="muted">{t.modelo} · {t.color}</td>
              <td><span title={ZONAS[t.zona].n}>E{t.espacio} · {ZONAS[t.zona].n.length > 24 ? ZONAS[t.zona].n.slice(0, 23) + '…' : ZONAS[t.zona].n}</span></td>
              <td className="tnum">{fecha(t.inicio)}</td><td className="tnum muted">{t.fin ? hhmm(t.fin) : '—'}</td>
              <td><Who c={t.cobrador} /></td><td><PillEstado t={t} /></td><td><Constancia t={t} /></td><td><Gps p={t.gpsCobro || t.gps} /></td><td className="tnum muted">{t.op || '—'}</td><td className="r tnum"><b>{money(t.monto)}</b></td>
            </tr>)}
            {!l.length && <tr><td colSpan={11} className="vacio"><Icon n="search" size={28} /><b>No hay movimientos con esos filtros</b><span>Prueba con otra placa o quita algún filtro.</span></td></tr>}
          </motion.tbody>
        </AnimatePresence>
      </table></div>
      {/* Paginación */}
      <div className="pager"><span>{l.length} movimientos · página {p + 1} de {pages}</span>
        <span className="pager-b">
          <button className="btn btn-out sm" disabled={!p} onClick={() => ir(p - 1)}><Icon n="chevL" size={16} />Anterior</button>
          <button className="btn btn-out sm" disabled={p >= pages - 1} onClick={() => ir(p + 1)}>Siguiente<Icon n="chevR" size={16} /></button>
        </span></div>
    </Card>
  </>;
}
