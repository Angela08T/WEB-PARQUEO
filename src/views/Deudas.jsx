// Deudas.jsx: vehículos que se fueron sin pagar (Pendientes) y los que pagaron al volver (Recuperadas).
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Card, CardHead, Chips, CountUp, Pill, Plate, Who, useUI, EASE } from '../components/ui.jsx';
import { AHORA, RECUPERADAS, T, ZONAS, hhmm, money, sum } from '../data.js';

// Fecha corta con hora, por ejemplo «mié., 14 oct. 10:57»
const fecha = d => d.toLocaleDateString('es-PE', { weekday:'short', day:'2-digit', month:'short' }) + ' ' + hhmm(d);

export default function Deudas(){
  const { toast } = useUI();
  // lista = deudas pendientes; recup = deudas recuperadas; tab = pestaña visible
  const [lista, setLista] = useState(() => T.filter(t => t.estado === 'pendiente'));
  const [recup, setRecup] = useState(() => RECUPERADAS.slice());
  const [tab, setTab] = useState('Pendientes');
  // «Cobrada»: pasa la deuda de Pendientes a Recuperadas (en el boceto no se guarda al recargar)
  const cobrar = t => {
    setLista(l => l.filter(x => x !== t)); setRecup(r => [{ ...t, estado:'pagado', recuperada:true, junto:false, metodo:'Efectivo', pagadoEn:AHORA }, ...r]);
    toast(`Boceto: ${t.placa} marcada como cobrada (no se guarda)`);
  };

  return <>
    {/* Indicadores: total por cobrar, vehículos con deuda y monto recuperado esta semana */}
    <div className="kpis k3">
      <Card i={0} className="kpi"><span className="lb"><span className="ic red"><Icon n="alert" /></span>Total por cobrar</span><b><CountUp value={sum(lista)} format={money} /></b><span className="dt">últimos 7 días</span></Card>
      <Card i={1} className="kpi"><span className="lb"><span className="ic yel"><Icon n="car" /></span>Vehículos con deuda</span><b><CountUp value={lista.length} /></b><span className="dt">la app avisa cuando vuelvan</span></Card>
      <Card i={2} className="kpi"><span className="lb"><span className="ic green"><Icon n="check" /></span>Deudas recuperadas</span><b><CountUp value={sum(recup)} format={money} /></b><span className="dt">{recup.length} {recup.length === 1 ? 'placa pagó' : 'placas pagaron'} al volver esta semana</span></Card>
    </div>
    <Card i={3}>
      <CardHead title={tab === 'Pendientes' ? 'Vehículos que se fueron sin pagar' : 'Deudas recuperadas'}
        sub={tab === 'Pendientes' ? 'Al volver a ingresar, el cobrador ve la alerta y cobra la deuda' : 'Placas que pagaron su deuda al volver: sola o junto con el nuevo estacionamiento'}>
        {/* Pestañas Pendientes / Recuperadas */}
        <Chips name="deudas" options={['Pendientes', 'Recuperadas']} value={tab} onChange={setTab} />
        <button className="btn btn-out" onClick={() => toast('En el boceto la descarga no está activa')}><Icon n="download" />Exportar</button>
      </CardHead>
      <div className="card-b"><div className="tbl-w"><AnimatePresence mode="wait" initial={false}>
        {/* Las dos tablas se intercambian con un deslizamiento; al marcar «Cobrada», la fila sale hacia la derecha */}
        {tab === 'Pendientes' ? <motion.table key="p" initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:14 }} transition={{ duration:.2, ease:EASE }}>
          <thead><tr><th>Placa</th><th>Vehículo</th><th>Fecha</th><th>Zona · espacio</th><th>Tiempo</th><th>Registró</th><th className="r">Monto</th><th /></tr></thead>
          <tbody><AnimatePresence initial={false}>{lista.map((t, i) => <motion.tr key={t.id} layout
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0, transition:{ delay:Math.min(i, 12) * .03, ease:EASE } }} exit={{ opacity:0, x:40, transition:{ duration:.3 } }}>
            <td><Plate p={t.placa} /></td><td className="muted">{t.modelo} · {t.color}</td>
            <td className="tnum">{fecha(t.inicio)}</td>
            <td>E{t.espacio} · {ZONAS[t.zona].n}</td><td className="tnum muted">{Math.round((t.fin - t.inicio) / 60000)} min</td>
            <td><Who c={t.cobrador} /></td><td className="r tnum"><b style={{ color:'var(--bad)' }}>{money(t.monto)}</b></td>
            <td className="r"><button className="btn btn-txt" onClick={() => cobrar(t)}><Icon n="check" size={16} />Cobrada</button></td>
          </motion.tr>)}</AnimatePresence></tbody>
        </motion.table>
        : <motion.table key="r" initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-14 }} transition={{ duration:.2, ease:EASE }}>
          <thead><tr><th>Placa</th><th>Vehículo</th><th>Se fue sin pagar</th><th>Pagó</th><th>Cómo se cobró</th><th>Cobrador</th><th>Medio</th><th className="r">Monto</th></tr></thead>
          <tbody>{recup.map((t, i) => <motion.tr key={t.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0, transition:{ delay:Math.min(i, 12) * .03, ease:EASE } }}>
            <td><Plate p={t.placa} /></td><td className="muted">{t.modelo} · {t.color}</td>
            <td className="tnum muted">{fecha(t.inicio)}</td><td className="tnum">{fecha(t.pagadoEn)}</td>
            <td>{t.junto ? <Pill k="on">Junto al estacionamiento</Pill> : <Pill k="off" dot={false}>Solo la deuda</Pill>}</td>
            <td><Who c={t.cobrador} /></td><td className="muted">{t.metodo}</td>
            <td className="r tnum"><b style={{ color:'var(--ok)' }}>{money(t.monto)}</b></td>
          </motion.tr>)}</tbody>
        </motion.table>}
      </AnimatePresence></div></div>
    </Card>
  </>;
}
