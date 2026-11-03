/* Mapa.jsx: «Ubicaciones». Plano esquemático de las zonas con la ubicación GPS de cada ingreso y cobro de hoy,
   y la lista de registros hechos a más de 120 m de su zona. Es un dibujo propio (SVG): no necesita internet. */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Card, CardHead, Chips, CountUp, Plate, EASE } from '../components/ui.jsx';
import { CALLES, COBR, FUERA, T, ZONAS, esHoy, hhmm, latlng } from '../data.js';

// Filtro por tipo de registro
const TIPOS = ['Todos', 'Ingresos', 'Cobros'];
/* Manzanas de fondo del plano (solo decorativas) */
const MANZANAS = [];
for (let x = 0; x < 1000; x += 115) for (let y = 0; y < 600; y += 95) MANZANAS.push([x + 8, y + 8, 95, 75]);

export default function Mapa(){
  const [tipo, setTipo] = useState('Todos'), [cob, setCob] = useState(''), [soloFuera, setSoloFuera] = useState(false);
  // hov = punto bajo el mouse; sel = punto elegido con clic (queda marcado)
  const [hov, setHov] = useState(null), [sel, setSel] = useState(null);

  // Registros de hoy: cada ingreso y cada cobro guardan dónde estaba el celular
  const todos = useMemo(() => {
    const l = [];
    T.filter(t => esHoy(t.inicio)).forEach(t => {
      l.push({ k:t.id + 'i', t, tipo:'Ingreso', p:t.gps, hora:t.inicio });
      if (t.gpsCobro && t.fin) l.push({ k:t.id + 'c', t, tipo:t.estado === 'pendiente' ? 'Se fue sin pagar' : 'Cobro', p:t.gpsCobro, hora:t.fin });
    });
    return l;
  }, []);
  // Puntos visibles según los filtros; fuera = registros lejos de su zona; prec = precisión GPS promedio
  const lista = todos.filter(r => (tipo === 'Todos' || (tipo === 'Ingresos' ? r.tipo === 'Ingreso' : r.tipo !== 'Ingreso')) && (!cob || r.t.cobrador.dni === cob) && (!soloFuera || r.p.fuera));
  const fuera = todos.filter(r => r.p.fuera && (!cob || r.t.cobrador.dni === cob)).sort((a, b) => b.hora - a.hora);
  const prec = Math.round(todos.reduce((s, r) => s + r.p.prec, 0) / (todos.length || 1));
  const marcado = sel || hov;

  return <>
    {/* Indicadores: registros con ubicación, precisión, fuera de zona y cobradores con GPS */}
    <div className="kpis">
      <Card i={0} className="kpi"><span className="lb"><span className="ic blue"><Icon n="pin" /></span>Registros con ubicación</span><b><CountUp value={todos.length} /></b><span className="dt">ingresos y cobros de hoy</span></Card>
      <Card i={1} className="kpi"><span className="lb"><span className="ic green"><Icon n="radio" /></span>Precisión promedio</span><b><CountUp value={prec} format={v => '±' + Math.round(v) + ' m'} /></b><span className="dt">según el GPS de cada celular</span></Card>
      <Card i={2} className="kpi"><span className="lb"><span className="ic red"><Icon n="alert" /></span>Fuera de zona</span><b><CountUp value={fuera.length} /></b><span className="dt">a más de {FUERA} m de su zona</span></Card>
      <Card i={3} className="kpi"><span className="lb"><span className="ic yel"><Icon n="users" /></span>Cobradores con GPS</span><b><CountUp value={COBR.filter(c => c.activo).length} /></b><span className="dt">registraron ubicación hoy</span></Card>
    </div>

    <div className="g2">
      <Card i={4}>
        <CardHead title="Plano de las zonas" sub={`Dónde se hizo cada registro hoy · ${lista.length} puntos`}>
          <label className="field" style={{ minWidth:200 }}><select value={cob} onChange={e => { setCob(e.target.value); setSel(null); }} aria-label="Cobrador">
            <option value="">Todos los cobradores</option>{COBR.filter(c => c.activo).map(c => <option key={c.dni} value={c.dni}>{c.nombre}</option>)}</select></label>
        </CardHead>
        {/* Filtros y leyenda de colores */}
        <div className="vivo-bar" style={{ padding:'12px 20px 0' }}>
          <Chips name="mapa" options={TIPOS} value={tipo} onChange={setTipo} />
          <button className={'chip' + (soloFuera ? ' on' : '')} onClick={() => setSoloFuera(v => !v)} aria-pressed={soloFuera}>
            {soloFuera && <motion.span layoutId="chip-fuera" className="chip-bg" style={{ background:'var(--bad)' }} />}<span className="chip-t">Solo fuera de zona</span></button>
          <div className="leg-live" style={{ marginLeft:'auto' }}><span><i style={{ background:'var(--primary)', borderColor:'var(--primary)', borderRadius:'50%' }} />Ingreso</span><span><i style={{ background:'var(--ok)', borderColor:'var(--ok)', borderRadius:'50%' }} />Cobro</span><span><i style={{ background:'var(--bad)', borderColor:'var(--bad)', borderRadius:'50%' }} />Fuera de zona</span></div>
        </div>
        <div className="card-b"><div className="plano">
          {/* Plano en un lienzo de 1000 × 600 «metros», dibujado por capas de abajo hacia arriba */}
          <svg viewBox="0 0 1000 600" role="img" aria-label="Plano esquemático de las zonas de estacionamiento con la ubicación de los registros de hoy">
            {/* 1. Manzanas de fondo */}
            <g className="pl-mz">{MANZANAS.map(([x, y, w, hh], i) => <rect key={i} x={x} y={y} width={w} height={hh} rx="8" />)}</g>
            {/* 2. Calles (la avenida es más ancha) y su línea central punteada */}
            <g className="pl-calle">{CALLES.map(c => <line key={c.n} x1={c.a[0]} y1={c.a[1]} x2={c.b[0]} y2={c.b[1]} strokeWidth={c.av ? 44 : 30} />)}</g>
            <g className="pl-eje">{CALLES.map(c => <line key={c.n} x1={c.a[0]} y1={c.a[1]} x2={c.b[0]} y2={c.b[1]} />)}</g>
            {/* 3. Tramo de cada zona con el color de su cobrador; se dibuja de punta a punta al abrir */}
            <g className="pl-zona">{ZONAS.map(z => { const c = COBR[Math.floor(z.id / 2)], act = !cob || c.dni === cob;
              return <motion.line key={z.id} x1={z.seg[0][0]} y1={z.seg[0][1]} x2={z.seg[1][0]} y2={z.seg[1][1]} style={{ stroke:c.tx }}
                initial={{ pathLength:0 }} animate={{ pathLength:1, opacity:act ? 1 : .2 }} transition={{ pathLength:{ duration:.9, delay:.2 + z.id * .05, ease:EASE }, opacity:{ duration:.3 } }} />; })}</g>
            {/* 4. Nombres de las calles (girados en las calles verticales) */}
            <g className="pl-nom">{CALLES.map(c => { const h = c.a[1] === c.b[1], x = h ? c.a[0] + 20 : c.a[0] + 26, y = h ? c.a[1] - (c.av ? 30 : 22) : c.a[1] + 18;
              return <text key={c.n} x={x} y={y} transform={h ? undefined : `rotate(90 ${x} ${y})`}>{c.n}</text>; })}</g>
            {/* 5. Puntos: azul = ingreso, verde = cobro, rojo = fuera de zona (más grande) */}
            <g>{lista.map((r, i) => { const c = r.p.fuera ? 'var(--bad)' : r.tipo === 'Ingreso' ? 'var(--primary)' : 'var(--ok)', on = marcado && marcado.k === r.k;
              return <motion.circle key={r.k} cx={r.p.x} cy={r.p.y} r={on ? 11 : r.p.fuera ? 8 : 5.5} className={'pl-pt' + (r.p.fuera ? ' fuera' : '')} style={{ fill:c }}
                initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring', stiffness:420, damping:22, delay:Math.min(i * .004, .9) }}
                onMouseEnter={() => setHov(r)} onMouseLeave={() => setHov(null)} onClick={() => setSel(s => s && s.k === r.k ? null : r)} />; })}</g>
            {/* 6. Si el punto marcado está fuera de zona, línea punteada hasta el centro de su tramo */}
            {marcado && marcado.p.fuera && <g className="pl-linea"><line x1={marcado.p.x} y1={marcado.p.y} x2={(ZONAS[marcado.t.zona].seg[0][0] + ZONAS[marcado.t.zona].seg[1][0]) / 2} y2={(ZONAS[marcado.t.zona].seg[0][1] + ZONAS[marcado.t.zona].seg[1][1]) / 2} /></g>}
          </svg>
          {/* Detalle del punto marcado (posición en % del plano, sin salirse de los bordes) */}
          <AnimatePresence>{marcado && <motion.div className="tip" key={marcado.k} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:.15 }}
            style={{ left:Math.max(24, Math.min(76, marcado.p.x / 10)) + '%', top:Math.max(24, marcado.p.y / 6) + '%' }}>
            <b>{marcado.t.placa} · {marcado.tipo}</b>{hhmm(marcado.hora)} · {marcado.t.cobrador.nombre}<br />
            {ZONAS[marcado.t.zona].n} · GPS ±{marcado.p.prec} m{marcado.p.fuera ? <><br /><span style={{ color:'#FF9AA4', fontWeight:700 }}>A {marcado.p.dist} m de su zona</span></> : ''}
          </motion.div>}</AnimatePresence>
        </div>
        <p className="muted" style={{ margin:'10px 0 0', fontSize:12.5 }}>Plano esquemático con ubicaciones de ejemplo. Al conectar el servidor se usarán las coordenadas reales que guarda la app.</p></div>
      </Card>

      <Card i={5}>
        <CardHead title="Registros fuera de zona" sub={`Hechos a más de ${FUERA} m del tramo asignado`} />
        <div className="card-b"><div className="fz">
          {/* Lista de registros fuera de zona, del más reciente al más antiguo; al tocar uno se marca en el plano */}
          {fuera.length ? fuera.map((r, i) => { const ll = latlng(r.p);
            return <motion.button key={r.k} className={'fz-i' + (sel && sel.k === r.k ? ' on' : '')} onClick={() => setSel(s => s && s.k === r.k ? null : r)}
              initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:.3 + i * .05, ease:EASE }}>
              <span className="ic red"><Icon n="alert" size={16} /></span>
              <div className="mid"><b><Plate p={r.t.placa} /> {r.tipo} · {hhmm(r.hora)}</b>
                <small>{r.t.cobrador.nombre} · {ZONAS[r.t.zona].n}</small>
                <small>A <b>{r.p.dist} m</b> de su zona · {ll.lat}, {ll.lng}</small></div>
            </motion.button>; })
            : <p className="qs-empty">No hay registros fuera de zona hoy.</p>}
        </div></div>
      </Card>
    </div>
  </>;
}
