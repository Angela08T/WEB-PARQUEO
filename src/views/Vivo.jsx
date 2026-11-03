/* Vivo.jsx: «Ocupación en vivo». Muestra cada espacio de las 12 zonas (libre, ocupado o con más de 2 horas).
   Por ahora simula que los vehículos entran y salen; con el servidor, se actualizará con lo que registran las apps. */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Chips, CountUp, Fill, Pill, EASE } from '../components/ui.jsx';
import { AHORA, COBR, MOD, T, ZONAS, hhmm, money, pick, placa, rnd } from '../data.js';

// Filtros de arriba: todas las zonas, las más llenas (40% o más) o las que tienen 10 o más espacios libres
const FILTROS = ['Todas', 'Más ocupadas', 'Con espacios libres'];

export default function Vivo(){
  // ocupación por zona: { [espacio]: vehículo }
  const [oc, setOc] = useState(() => ZONAS.map(z => { const m = {}; T.filter(t => t.estado === 'activo' && t.zona === z.id).forEach(t => m[t.espacio] = t); return m; }));
  // cambio = último espacio que entró o salió (para resaltarlo); tip = detalle del espacio bajo el mouse
  const [cambio, setCambio] = useState(null);
  const [filtro, setFiltro] = useState('Todas');
  const [tip, setTip] = useState(null);

  // Simulación: cada 3.5 s un vehículo entra o sale de algún espacio
  useEffect(() => {
    let min = 1;
    const t = setInterval(() => {
      const z = Math.floor(rnd() * ZONAS.length), e = 1 + Math.floor(rnd() * ZONAS[z].cap);
      setOc(prev => {
        const n = prev.slice(), m = { ...n[z] };
        if (m[e]) delete m[e];
        else { const [modelo, color] = pick(MOD); m[e] = { placa:placa(), inicio:new Date(AHORA.getTime() + min * 60000), monto:.8, modelo, color }; }
        n[z] = m; return n;
      });
      setCambio(z + '-' + e + '-' + min++);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // Total de vehículos y lista de zonas según el filtro elegido
  const total = oc.reduce((s, m) => s + Object.keys(m).length, 0);
  const zonas = useMemo(() => {
    const l = ZONAS.map(z => ({ z, n:Object.keys(oc[z.id]).length }));
    if (filtro === 'Más ocupadas') return l.filter(x => x.n / x.z.cap >= .4).sort((a, b) => b.n / b.z.cap - a.n / a.z.cap);
    if (filtro === 'Con espacios libres') return l.filter(x => x.z.cap - x.n >= 10);
    return l;
  }, [oc, filtro]);

  return <>
    {/* Barra superior: filtros, leyenda de colores y contador en vivo */}
    <motion.div className="vivo-bar" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
      <Chips name="vivo" options={FILTROS} value={filtro} onChange={setFiltro} />
      <div className="leg-live"><span><i />Libre</span><span><i className="o" />Ocupado</span><span><i className="y" />Más de 2 horas</span></div>
      <span className="vivo-n"><span className="live-tag"><i />En vivo</span><b><CountUp value={total} duration={.5} /></b> vehículos</span>
    </motion.div>
    {/* Una tarjeta por zona; «layout» anima el reacomodo al cambiar el filtro */}
    <motion.div className="zones" layout>
      <AnimatePresence mode="popLayout">{zonas.map(({ z, n }, zi) => {
        // p = porcentaje ocupado; c = cobrador de la zona (cada cobrador tiene dos zonas: IMPAR y PAR)
        const p = n / z.cap, c = COBR[Math.floor(z.id / 2)], m = oc[z.id];
        return <Card key={z.id} i={zi} className="zone" layout exit={{ opacity:0, scale:.95 }}>
          <div className="zone-h"><div><b>{z.n}</b><small>{c.nombre}</small></div>
            <Pill k={p >= .8 ? 'yel' : n ? 'on' : 'off'}><CountUp value={z.cap - n} duration={.4} /> libres</Pill></div>
          <div className="spaces">{Array.from({ length:z.cap }, (_, i) => {
            const t = m[i + 1], mins = t ? Math.round((AHORA - t.inicio) / 60000) : 0, k = z.id + '-' + (i + 1);
            // Si este espacio acaba de cambiar, hace un pulso con un anillo amarillo
            const flash = cambio && cambio.startsWith(k + '-');
            return <motion.span key={i} className={'sp' + (t ? ' oc' : '') + (t && mins > 120 ? ' lg' : '')}
              initial={{ scale:0, opacity:0 }} animate={flash ? { scale:[1, 1.35, 1], opacity:1 } : { scale:1, opacity:1 }}
              transition={flash ? { duration:.5 } : { type:'spring', stiffness:520, damping:24, delay:.15 + zi * .04 + i * .008 }}
              onMouseEnter={e => t && setTip({ t, e:i + 1, mins, r:e.currentTarget.getBoundingClientRect() })} onMouseLeave={() => setTip(null)}>
              {flash && <motion.span className="ring" initial={{ scale:.8, opacity:.8 }} animate={{ scale:2.2, opacity:0 }} transition={{ duration:.8 }} />}
              {i + 1}
            </motion.span>;
          })}</div>
          {/* Barra de ocupación de la zona */}
          <div className="zbar"><Fill pct={p * 100} delay={.3 + zi * .04} /></div>
        </Card>;
      })}</AnimatePresence>
    </motion.div>
    {/* Cuadro con placa, hora de entrada, vehículo, tiempo y monto del espacio bajo el mouse */}
    <AnimatePresence>{tip && <motion.div className="tip fixed" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:.12, ease:EASE }}
      style={{ left:tip.r.left + tip.r.width / 2, top:tip.r.top - 8 }}>
      <b>{tip.t.placa}</b>Espacio {tip.e} · desde las {hhmm(tip.t.inicio)}<br />{tip.t.modelo} · {tip.t.color}<br />
      {tip.mins >= 60 ? Math.floor(tip.mins / 60) + ' h ' : ''}{Math.max(tip.mins, 0) % 60} min · {money(tip.t.monto)}
    </motion.div>}</AnimatePresence>
  </>;
}
