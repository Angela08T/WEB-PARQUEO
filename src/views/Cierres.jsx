/* Cierres.jsx: cuadre de caja que hace cada cobrador al cerrar su turno en la app.
   Compara el efectivo que debía entregar (suma de cobros en efectivo) con el que contó, y muestra el motivo si no cuadra. */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Card, CardHead, Chips, CountUp, Pill, Who, useUI, EASE } from '../components/ui.jsx';
import { AHORA, COBR, TURNOS, hhmm, money } from '../data.js';

// Filtros por resultado; dia() da la fecha corta del turno
const FILTROS = ['Todos', 'Con diferencia', 'Cuadraron', 'En curso'];
const dia = d => d.toLocaleDateString('es-PE', { weekday:'short', day:'numeric', month:'short' });

/* Diferencia del cuadre: cuadró, faltó o sobró */
const Dif = ({ t }) => t.diferencia === null ? <Pill k="on">En turno</Pill>
  : Math.abs(t.diferencia) < .005 ? <Pill k="ok">Cuadró</Pill>
  : t.diferencia < 0 ? <Pill k="bad">Faltó {money(-t.diferencia)}</Pill> : <Pill k="yel">Sobró {money(t.diferencia)}</Pill>;

export default function Cierres(){
  const { toast } = useUI();
  const [f, setF] = useState('Todos'), [cob, setCob] = useState('');
  // Solo los turnos ya cerrados (con hora de fin) cuentan para los indicadores
  const cerrados = TURNOS.filter(t => t.hasta);
  const faltante = cerrados.filter(t => t.diferencia < 0), sobrante = cerrados.filter(t => t.diferencia > 0);
  const cuadran = cerrados.filter(t => Math.abs(t.diferencia) < .005).length;
  // Turnos visibles según el filtro de resultado y el cobrador elegido
  const lista = useMemo(() => TURNOS.filter(t => (!cob || t.cobrador.dni === cob) && (
    f === 'Con diferencia' ? t.hasta && Math.abs(t.diferencia) >= .005 : f === 'Cuadraron' ? t.hasta && Math.abs(t.diferencia) < .005 : f === 'En curso' ? !t.hasta : true)), [f, cob]);

  return <>
    {/* Indicadores: cantidad de cierres, porcentaje que cuadró, faltante y sobrante total */}
    <div className="kpis">
      <Card i={0} className="kpi"><span className="lb"><span className="ic blue"><Icon n="wallet" /></span>Cierres de turno</span><b><CountUp value={cerrados.length} /></b><span className="dt">en los últimos 6 días</span></Card>
      <Card i={1} className="kpi"><span className="lb"><span className="ic green"><Icon n="check" /></span>Cajas que cuadraron</span><b><CountUp value={cerrados.length ? cuadran / cerrados.length * 100 : 0} format={v => Math.round(v) + '%'} /></b><span className="dt">{cuadran} de {cerrados.length} cierres</span></Card>
      <Card i={2} className="kpi"><span className="lb"><span className="ic red"><Icon n="alert" /></span>Faltante total</span><b><CountUp value={-faltante.reduce((s, t) => s + t.diferencia, 0)} format={money} /></b><span className="dt">{faltante.length} {faltante.length === 1 ? 'cierre' : 'cierres'} con faltante</span></Card>
      <Card i={3} className="kpi"><span className="lb"><span className="ic yel"><Icon n="coins" /></span>Sobrante total</span><b><CountUp value={sobrante.reduce((s, t) => s + t.diferencia, 0)} format={money} /></b><span className="dt">{sobrante.length} {sobrante.length === 1 ? 'cierre' : 'cierres'} con sobrante</span></Card>
    </div>

    <Card i={4}>
      <CardHead title="Cuadre de caja por turno" sub="Lo que el cobrador debía entregar en efectivo frente a lo que contó al cerrar su turno en la app">
        <button className="btn btn-out" onClick={() => toast('En el boceto la descarga no está activa')}><Icon n="download" />Exportar Excel</button>
      </CardHead>
      {/* Filtros: resultado y cobrador */}
      <div className="vivo-bar" style={{ padding:'14px 20px 0' }}>
        <Chips name="cierres" options={FILTROS} value={f} onChange={setF} />
        <label className="field" style={{ marginLeft:'auto', minWidth:220 }}><select value={cob} onChange={e => setCob(e.target.value)} aria-label="Cobrador">
          <option value="">Todos los cobradores</option>{COBR.filter(c => c.activo).map(c => <option key={c.dni} value={c.dni}>{c.nombre}</option>)}</select></label>
      </div>
      <div className="card-b"><div className="tbl-w"><table>
        <thead><tr><th>Cobrador</th><th>Turno</th><th className="r">Cobros</th><th className="r">Por QR</th><th className="r">Efectivo a entregar</th><th className="r">Contado</th><th>Resultado</th><th>Motivo de la diferencia</th></tr></thead>
        <AnimatePresence mode="wait" initial={false}>
          {/* Una fila por turno; los de hoy aparecen «En turno» hasta que el cobrador lo cierre */}
          <motion.tbody key={f + cob} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:.2, ease:EASE }}>
            {lista.map(t => <tr key={t.id}>
              <td><Who c={t.cobrador} /></td>
              <td className="tnum"><b>{t.desde.toDateString() === AHORA.toDateString() ? 'Hoy' : dia(t.desde)}</b><div className="muted" style={{ fontSize:12.5 }}>{hhmm(t.desde)} – {t.hasta ? hhmm(t.hasta) : 'en curso'}</div></td>
              <td className="r tnum">{t.cobros}</td><td className="r tnum">{money(t.qr)}</td>
              <td className="r tnum"><b>{money(t.efectivo)}</b></td>
              <td className="r tnum">{t.contado === null ? <span className="muted">—</span> : money(t.contado)}</td>
              <td><Dif t={t} /></td>
              <td className="muted" style={{ whiteSpace:'normal', minWidth:220 }}>{t.nota ? '«' + t.nota + '»' : '—'}</td>
            </tr>)}
            {!lista.length && <tr><td colSpan={8} className="vacio"><Icon n="wallet" size={28} /><b>No hay cierres con ese filtro</b><span>Prueba con otro cobrador o quita el filtro.</span></td></tr>}
          </motion.tbody>
        </AnimatePresence>
      </table></div></div>
    </Card>
  </>;
}
