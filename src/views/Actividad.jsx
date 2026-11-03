/* Actividad.jsx: registro de lo que pasa en el panel y en las apps (solo administrador):
   inicios de sesión, cambios de configuración, sincronizaciones y avisos. */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Card, CardHead, Chips, CountUp, EASE } from '../components/ui.jsx';
import { ACTIVIDAD, ADMINS, COBR } from '../data.js';

// Filtro por origen y color de cada tipo de evento
const FILTROS = { 'Todo':null, 'Panel web':'web', 'App de campo':'app' };
const COLOR = { login:'blue', sync:'green', alert:'red', edit:'yel', download:'blue', coins:'yel' };

export default function Actividad(){
  const [f, setF] = useState('Todo');
  const l = ACTIVIDAD.filter(a => !FILTROS[f] || a[0] === FILTROS[f]);
  // Cobradores activos y celulares con una versión de la app anterior a la actual
  const enCampo = COBR.filter(c => c.activo).length, desact = COBR.filter(c => c.ver && c.ver !== '1.4.2').length;

  return <>
    <div className="kpis">
      <Card i={0} className="kpi"><span className="lb"><span className="ic green"><Icon n="car" /></span>Cobradores conectados</span><b><CountUp value={enCampo} /></b><span className="dt">sincronizaron en los últimos 10 min</span></Card>
      <Card i={1} className="kpi"><span className="lb"><span className="ic blue"><Icon n="grid" /></span>Sesiones en el panel hoy</span><b><CountUp value={ADMINS.filter(a => /^(Hoy|Ahora)/.test(a.ultimo)).length} /></b><span className="dt">personal administrativo y administradores</span></Card>
      <Card i={2} className="kpi"><span className="lb"><span className="ic red"><Icon n="alert" /></span>Apps desactualizadas</span><b><CountUp value={desact} /></b><span className="dt">la versión actual es 1.4.2</span></Card>
      <Card i={3} className="kpi"><span className="lb"><span className="ic yel"><Icon n="edit" /></span>Cambios de configuración</span><b><CountUp value={2} /></b><span className="dt">usuarios, zonas y QR de cobro hoy</span></Card>
    </div>
    <Card i={4}>
      <CardHead title="Registro de actividad de hoy" sub="Inicios de sesión, cambios y sincronizaciones de las apps">
        <Chips name="act" options={Object.keys(FILTROS)} value={f} onChange={setF} />
      </CardHead>
      {/* Línea de tiempo: hora, ícono del evento, descripción y origen */}
      <div className="card-b"><div className="tl">
        <AnimatePresence mode="popLayout" initial={false}>{l.map(([o, i, t, d, h], k) =>
          <motion.div key={t} className="tl-i" layout initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0, transition:{ delay:k * .04, ease:EASE } }} exit={{ opacity:0, x:14 }}>
            <span className="tl-h tnum">{h}</span>
            <span className={'tl-dot ic ' + COLOR[i]}><Icon n={i === 'login' ? 'arrow' : i === 'sync' ? 'check' : i} size={15} /></span>
            <div className="tl-t"><b>{t}</b><small>{d}</small></div>
            <span className={'tl-o ' + o}>{o === 'web' ? 'Panel web' : 'App de campo'}</span>
          </motion.div>)}</AnimatePresence>
      </div></div>
    </Card>
  </>;
}
