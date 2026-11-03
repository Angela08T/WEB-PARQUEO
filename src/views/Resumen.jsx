/* Resumen.jsx: pantalla de inicio. Indicadores del día, control del día, recaudación por hora,
   medios de pago, ocupación por zona, últimos movimientos y ranking de cobradores. */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Bars, Card, CardHead, Chips, CountUp, Donut, Fill, Spark, Who, useUI, EASE } from '../components/ui.jsx';
import { AHORA, CAP, COBR, RECUPERADAS, T, TURNOS, ZONAS, esHoy, hhmm, money, nuevoMovimiento, sum } from '../data.js';

// Calcula todos los números del Resumen a partir de los movimientos (se hace una sola vez al abrir la pantalla)
function calcular(){
  const hoy = T.filter(t => esHoy(t.inicio)), pag = hoy.filter(t => t.estado === 'pagado');
  // Comparación con ayer hasta la misma hora, para el porcentaje ▲/▼ de «Recaudado hoy»
  const ayer = new Date(AHORA); ayer.setDate(ayer.getDate() - 1);
  const pagAyer = T.filter(t => t.estado === 'pagado' && t.inicio.toDateString() === ayer.toDateString() && t.inicio.getHours() <= AHORA.getHours());
  const tot = sum(pag), dif = pagAyer.length ? (tot / sum(pagAyer) - 1) * 100 : 0;
  const act = T.filter(t => t.estado === 'activo'), deu = T.filter(t => t.estado === 'pendiente');
  // Montos por medio de pago (para la dona)
  const qr = sum(pag.filter(t => t.metodo === 'QR')), ef = sum(pag.filter(t => t.metodo === 'Efectivo')), de = sum(hoy.filter(t => t.estado === 'pendiente'));
  // Horas de 7:00 a la actual: recaudación por hora (gráfico de barras) y datos de los minigráficos
  const hs = []; for (let h = 7; h <= AHORA.getHours(); h++) hs.push(h);
  const horas = hs.map(h => { const l = pag.filter(t => t.fin && t.fin.getHours() === h); return { h, v:sum(l), n:l.length }; });
  const spIng = hs.map(h => hoy.filter(t => t.inicio.getHours() === h).length);
  let acc = 0; const spAte = spIng.map(v => acc += v);
  const spDeu = Array.from({ length:7 }, (_, i) => { const d = new Date(AHORA); d.setDate(d.getDate() - 6 + i); return deu.filter(t => t.inicio.toDateString() === d.toDateString()).length; });
  // Ranking de cobradores: pagos, deudas y monto recaudado hoy, de mayor a menor
  const porC = COBR.filter(c => c.activo).map(c => { const l = pag.filter(t => t.cobrador === c); return { c, n:l.length, s:sum(l), d:hoy.filter(t => t.cobrador === c && t.estado === 'pendiente').length }; }).sort((a, b) => b.s - a.s);
  return { hoy, pag, tot, dif, act, deu, qr, ef, de, horas, spIng, spAte, spDeu, porC,
    // ticket = pago promedio; perm = minutos promedio que estuvo estacionado un vehículo
    ticket:pag.length ? tot / pag.length : 0, perm:pag.length ? pag.reduce((s, t) => s + (t.fin - t.inicio), 0) / pag.length / 60000 : 0 };
}

export default function Resumen(){
  const { toast } = useUI();
  const d = useMemo(calcular, []);
  const [rango, setRango] = useState('Hoy');

  return <>
    {/* Cuatro indicadores principales, cada uno con su minigráfico */}
    <div className="kpis">
      <Card i={0} className="kpi hero">
        <span className="lb"><span className="ic"><Icon n="trend" /></span>Recaudado hoy</span>
        <div className="kv"><b><CountUp value={d.tot} format={money} /></b><Spark vals={d.horas.map(h => h.v)} color="#F7B500" /></div>
        <span className="dt"><span className={d.dif >= 0 ? 'up' : 'dn'}>{d.dif >= 0 ? '▲' : '▼'} {Math.abs(d.dif).toFixed(0)}%</span> frente a ayer a esta hora</span>
      </Card>
      <Card i={1} className="kpi">
        <span className="lb"><span className="ic blue"><Icon n="car" /></span>En parqueo ahora</span>
        <div className="kv"><b><CountUp value={d.act.length} /></b><Spark vals={d.spIng} color="var(--primary)" /></div>
        <span className="dt">{Math.round(d.act.length / CAP * 100)}% de {CAP} espacios ocupados</span>
      </Card>
      <Card i={2} className="kpi">
        <span className="lb"><span className="ic yel"><Icon n="check" /></span>Vehículos atendidos</span>
        <div className="kv"><b><CountUp value={d.hoy.length} /></b><Spark vals={d.spAte} color="#E0A000" /></div>
        <span className="dt">{d.pag.length} pagaron · {d.act.length} siguen en parqueo</span>
      </Card>
      <Card i={3} className="kpi">
        <span className="lb"><span className="ic red"><Icon n="alert" /></span>Deudas por cobrar</span>
        <div className="kv"><b><CountUp value={sum(d.deu)} format={money} /></b><Spark vals={d.spDeu} color="var(--bad)" /></div>
        <span className="dt">{d.deu.length} vehículos en los últimos 7 días</span>
      </Card>
    </div>

    {/* Accesos a lo que conviene revisar hoy (constancias, cajas, ubicaciones y deudas recuperadas) */}
    <Control />

    <div className="g2">
      {/* Recaudación por hora (los botones Ayer y 7 días todavía solo muestran un aviso) */}
      <Card i={4}>
        <CardHead title="Recaudación por hora" sub="Pagos registrados hoy, en soles · en amarillo, la hora en curso">
          <Chips name="rango" options={['Hoy', 'Ayer', '7 días']} value={rango} onChange={o => { setRango(o); if (o !== 'Hoy') toast('En el boceto el gráfico solo muestra «Hoy»'); }} />
        </CardHead>
        <div className="card-b"><Bars data={d.horas} /></div>
      </Card>
      {/* Cómo se cobró: QR, efectivo y lo que quedó sin pagar */}
      <Card i={5}>
        <CardHead title="Cómo se cobró hoy" sub="Pasa el mouse sobre la dona para ver cada medio" />
        <div className="card-b">
          <Donut total={money(d.qr + d.ef)} sub="cobrado hoy" parts={[{ label:'QR (Yape / Plin)', v:d.qr, color:'var(--c-qr)' }, { label:'Efectivo', v:d.ef, color:'var(--c-ef)' }, { label:'Sin pagar', v:d.de, color:'var(--c-de)' }]} />
          <div className="minis">
            <div><small>Ticket promedio</small><b><CountUp value={d.ticket} format={money} /></b></div>
            <div><small>Permanencia promedio</small><b><CountUp value={d.perm} format={v => Math.round(v) + ' min'} /></b></div>
          </div>
        </div>
      </Card>
    </div>

    <div className="g2">
      {/* Ocupación de cada zona (en amarillo las que pasan del 80%) */}
      <Card i={6}>
        <CardHead title="Ocupación por zona" sub="Espacios ocupados ahora · en amarillo, zonas sobre 80%"><a className="btn btn-txt" href="#vivo">Ver en vivo<Icon n="chevR" size={16} /></a></CardHead>
        <div className="card-b"><div className="occ">{ZONAS.map((z, i) => { const o = d.act.filter(t => t.zona === z.id).length, p = o / z.cap;
          return <div className="occ-r" key={z.id}><span title={z.n}>{z.n}</span><span className="tr"><Fill pct={p * 100} className={p >= .8 ? 'hi' : ''} delay={.4 + i * .04} /></span><b className="tnum">{o}/{z.cap}</b></div>; })}</div></div>
      </Card>
      <Card i={7}><Feed /></Card>
    </div>

    {/* Desempeño de los cobradores: medalla para los 3 primeros y barra comparada con el primero */}
    <Card i={8}>
      <CardHead title="Desempeño de cobradores hoy" sub="Ordenado por monto recaudado"><a className="btn btn-txt" href="#usuarios">Gestionar<Icon n="chevR" size={16} /></a></CardHead>
      <div className="card-b" style={{ paddingTop:8 }}><div className="tbl-w"><table>
        <thead><tr><th style={{ width:44 }}>#</th><th>Cobrador</th><th>Zonas</th><th className="r">Pagos</th><th className="r">Deudas</th><th className="r">Recaudado</th></tr></thead>
        <tbody>{d.porC.map((r, i) => <motion.tr key={r.c.dni} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:.6 + i * .05, ease:EASE }}>
          <td><span className={'rk' + (i < 3 ? ' g' + (i + 1) : '')}>{i + 1}</span></td><td><Who c={r.c} /></td>
          <td className="muted">{[...new Set(r.c.zonas.map(z => ZONAS[z].n.replace(/ (IMPAR|PAR)$/, '')))].join(', ')}</td>
          <td className="r tnum">{r.n}</td><td className="r tnum">{r.d ? <span className="pill bad">{r.d}</span> : <span className="muted">0</span>}</td>
          <td className="r tnum"><span className="share"><span className="tr"><Fill pct={d.porC[0].s ? r.s / d.porC[0].s * 100 : 0} delay={.8 + i * .05} /></span><b>{money(r.s)}</b></span></td>
        </motion.tr>)}</tbody>
      </table></div></div>
    </Card>
  </>;
}

/* Control del día: lo que conviene revisar (constancias, cajas, ubicación y deudas recuperadas) */
function Control(){
  // Alertas de constancia de hoy, cierres con faltante, registros fuera de zona y deudas recuperadas
  const qrHoy = T.filter(t => esHoy(t.inicio) && t.metodo === 'QR');
  const alertas = qrHoy.filter(t => t.verif && t.verif.estado === 'alerta').length, verif = qrHoy.filter(t => t.verif && t.verif.estado === 'ok').length;
  const ayer = TURNOS.filter(t => t.hasta && t.diferencia < 0);
  const fuera = T.filter(t => esHoy(t.inicio) && ((t.gps && t.gps.fuera) || (t.gpsCobro && t.gpsCobro.fuera))).length;
  // Cada acceso: [sección a la que lleva, ícono, color, título, número, detalle]
  const ITEMS = [
    ['#movimientos', 'shield', alertas ? 'red' : 'green', 'Constancias con alerta', alertas, `${Math.round(verif / (qrHoy.length || 1) * 100)}% de los pagos con QR se verificaron`],
    ['#cierres', 'wallet', ayer.length ? 'red' : 'green', 'Cajas con faltante', ayer.length, `${money(-ayer.reduce((s, t) => s + t.diferencia, 0))} en los últimos 6 días`],
    ['#mapa', 'pin', fuera ? 'yel' : 'green', 'Registros fuera de zona', fuera, 'hoy, a más de 120 m de su tramo'],
    ['#deudas', 'check', 'green', 'Deudas recuperadas', money(sum(RECUPERADAS)), `${RECUPERADAS.length} placas pagaron al volver esta semana`]
  ];
  return <Card i={4} className="ctl">
    <CardHead title="Control del día" sub="Lo que conviene revisar hoy" />
    <div className="ctl-g">{ITEMS.map(([href, i, c, t, v, d], k) => <motion.a key={href} href={href} className="ctl-i" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.35 + k * .07, ease:EASE }} whileHover={{ y:-2 }}>
      <span className={'ic ' + c}><Icon n={i} size={18} /></span><div className="mid"><small>{t}</small><b className="tnum">{v}</b><span>{d}</span></div><Icon n="chevR" size={16} className="ctl-go" />
    </motion.a>)}</div>
  </Card>;
}

/* Últimos movimientos: cada pocos segundos llega uno nuevo (simulación del tiempo real) */
function Feed(){
  const [items, setItems] = useState(() => T.slice(0, 6));
  useEffect(() => {
    // Simulación: cada 5,5 s aparece un movimiento nuevo arriba y se quedan los 6 más recientes
    let n = 1;
    const t = setInterval(() => setItems(l => [nuevoMovimiento(n++), ...l].slice(0, 6)), 5500);
    return () => clearInterval(t);
  }, []);
  return <>
    <CardHead title={<>Últimos movimientos <span className="live-tag"><i />En vivo</span></>} sub="Lo más reciente de los cobradores"><a className="btn btn-txt" href="#movimientos">Ver todo<Icon n="chevR" size={16} /></a></CardHead>
    <div className="card-b"><div className="feed">
      <AnimatePresence initial={false}>{items.map(t => {
        const [cl, i, tx] = t.estado === 'activo' ? ['blue', 'car', 'Ingresó'] : t.estado === 'pagado' ? ['green', 'check', 'Pagó · ' + t.metodo] : ['red', 'alert', 'Se fue sin pagar'];
        return <motion.div key={t.id} className={'fi' + (t.id[0] === 'n' ? ' nuevo' : '')} layout
          initial={{ opacity:0, height:0, y:-12 }} animate={{ opacity:1, height:'auto', y:0 }} exit={{ opacity:0, height:0 }} transition={{ duration:.45, ease:EASE }}>
          <div className="fi-in"><span className={'ic ' + cl}><Icon n={i} /></span>
            <div className="mid"><b>{t.placa}</b> · {tx}<small>{hhmm(t.fin || t.inicio)} · E{t.espacio} · {ZONAS[t.zona].n}</small></div>
            <span className="amt">{t.estado === 'activo' ? '' : money(t.monto)}</span></div>
        </motion.div>; })}</AnimatePresence>
    </div></div>
  </>;
}
