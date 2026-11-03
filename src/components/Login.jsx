/* Login.jsx: pantalla de inicio de sesión.
   Izquierda: presentación animada (tarjetas de ejemplo que siguen al mouse). Derecha: formulario con elección de perfil.
   Es un boceto: valida el formato del DNI, pero todavía no consulta usuarios reales. */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimate, useMotionValue, useSpring, useTransform } from 'motion/react';
import Icon from './Icon.jsx';
import { CountUp, EASE, useUI } from './ui.jsx';
import { ZONAS, CAP, ROLES, SESION_DEMO, money } from '../data.js';
import logo from '../../../app-movil/recursos/logo-sjl.png';

// Datos de las tarjetas decorativas: pagos que van rotando, espacios de una zona (o = ocupado, y = más de 2 h) y altura de las barras
const PAGOS = [['ZKY-198', 1.6, 'Yape'], ['BPY-660', 2.4, 'Plin'], ['GRT-969', 0.8, 'Efectivo'], ['HCR-998', 3.2, 'Yape']];
const SP = 'oo.oy.oo.o.oyo.oo.'.split('');
const BARS = [18, 30, 52, 64, 86, 58, 60, 72, 68, 96];

// Animaciones de entrada: cada elemento sube y aparece; «grupo» los hace aparecer uno tras otro
const sube = { hidden:{ opacity:0, y:22 }, show:{ opacity:1, y:0, transition:{ duration:.7, ease:EASE } } };
const grupo = d => ({ hidden:{}, show:{ transition:{ staggerChildren:.08, delayChildren:d } } });

export default function Login({ onEnter }){
  const { toast } = useUI();
  // Perfil elegido; al cambiarlo se llena el DNI del usuario de ejemplo de ese perfil
  const [rol, setRol] = useState('staff');
  const [dni, setDni] = useState(SESION_DEMO.staff.dni), [pass, setPass] = useState('boceto');
  const elegir = r => { setRol(r); setDni(SESION_DEMO[r].dni); setErr({}); };
  const [ver, setVer] = useState(false), [err, setErr] = useState({}), [busy, setBusy] = useState(false);
  // Para sacudir el formulario cuando hay un error
  const [form, animar] = useAnimate();
  const [pago, setPago] = useState(0);

  // Parallax: las tarjetas siguen al mouse con distinta profundidad
  // Parallax: la posición del mouse (de -0.5 a 0.5) mueve cada tarjeta a distinta velocidad, con efecto resorte
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness:80, damping:18 }), sy = useSpring(my, { stiffness:80, damping:18 });
  const p1x = useTransform(sx, v => v * 14), p1y = useTransform(sy, v => v * 10);
  const p2x = useTransform(sx, v => v * -22), p2y = useTransform(sy, v => v * -16);
  const p3x = useTransform(sx, v => v * 30), p3y = useTransform(sy, v => v * 20);
  const mover = e => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - .5); my.set((e.clientY - r.top) / r.height - .5); };

  // La notificación de pago de ejemplo cambia cada 3,2 segundos
  useEffect(() => { const t = setInterval(() => setPago(p => (p + 1) % PAGOS.length), 3200); return () => clearInterval(t); }, []);

  // Al enviar: el DNI debe tener 8 dígitos y la contraseña no puede estar vacía; si todo está bien, muestra «Verificando…» y entra
  const enviar = e => {
    e.preventDefault();
    const er = { dni:!/^\d{8}$/.test(dni), pass:!pass };
    setErr(er);
    if (er.dni || er.pass){ animar(form.current, { x:[0, -12, 10, -7, 5, 0] }, { duration:.45 }); document.getElementById(er.dni ? 'lgDni' : 'lgPass').focus(); return; }
    setBusy(true);
    setTimeout(() => onEnter(rol), 900);
  };

  return <motion.section className="login" exit={{ opacity:0, scale:1.04, filter:'blur(8px)' }} transition={{ duration:.6, ease:EASE }}>
    {/* Lado izquierdo: presentación de SICOE */}
    <div className="lg-art" onMouseMove={mover} onMouseLeave={() => { mx.set(0); my.set(0); }}>
      <span className="rb" /><span className="fx dots" /><span className="fx o1" /><span className="fx o2" /><span className="fx o3" />
      <motion.header className="lg-head" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:.7, ease:EASE }}>
        <div className="name" aria-label="SICOE">{'SICOE'.split('').map((l, i) =>
          <motion.span key={i} initial={{ opacity:0, y:30, rotate:-8 }} animate={{ opacity:1, y:0, rotate:0 }} transition={{ type:'spring', stiffness:380, damping:16, delay:.1 + i * .07 }}
            whileHover={{ y:-6, rotate:i % 2 ? 6 : -6 }}>{l}</motion.span>)}</div>
        <span className="lg-tag">Sistema de Cobro<br />de Estacionamiento</span>
      </motion.header>

      <motion.div className="lg-mid" variants={grupo(.35)} initial="hidden" animate="show">
        <motion.span variants={sube} className="lg-live"><i />Monitoreo de las zonas en vivo</motion.span>
        <motion.h2 variants={sube}>Control del estacionamiento municipal, <em>en tiempo real.</em></motion.h2>
        <motion.p variants={sube}>Recaudación, ocupación de zonas, deudas y cobradores de la Subgerencia de Transporte en un solo lugar.</motion.p>

        {/* Tres tarjetas flotantes de ejemplo: recaudación, espacios de una zona y último pago */}
        <motion.div variants={sube} className="scene" aria-hidden="true">
          <motion.div className="gl mk-a" style={{ x:p1x, y:p1y }}>
            <div className="float f1">
              <div className="mk-row"><span className="mk-ic"><Icon n="trend" /></span><span>Recaudado hoy</span><span className="mk-up">▲ 12%</span></div>
              <b className="mk-big"><CountUp value={237.6} format={money} duration={2} delay={.8} /></b>
              <div className="mk-bars">{BARS.map((h, i) => <motion.i key={i} className={i === BARS.length - 1 ? 'now' : ''} initial={{ height:0 }} animate={{ height:h + '%' }} transition={{ duration:.8, delay:.9 + i * .06, ease:EASE }} />)}</div>
            </div>
          </motion.div>
          <motion.div className="gl mk-b" style={{ x:p2x, y:p2y }}>
            <div className="float f2">
              <div className="mk-row"><span className="mk-ic blue"><Icon n="car" /></span><span>Jr. Las Maquinarias</span></div>
              <div className="mk-sp">{SP.map((s, i) => <motion.i key={i} className={s === 'o' ? 'o' : s === 'y' ? 'y' : ''} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:500, damping:20, delay:1 + i * .03 }} />)}</div>
              <small>11 de 18 espacios ocupados</small>
            </div>
          </motion.div>
          <motion.div className="gl mk-c" style={{ x:p3x, y:p3y }}>
            <span className="mk-ic green"><Icon n="check" /></span>
            <div className="mk-msg"><AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={pago} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-14 }} transition={{ duration:.35, ease:EASE }}>
                <b>{PAGOS[pago][0]} pagó {money(PAGOS[pago][1])}</b><small>{PAGOS[pago][2]} · hace un momento</small>
              </motion.div>
            </AnimatePresence></div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="lg-stats" variants={grupo(.9)} initial="hidden" animate="show">
        {[['pin', <CountUp value={ZONAS.length} delay={1} />, 'zonas'], ['car', <CountUp value={CAP} delay={1} />, 'espacios'], ['coins', 'S/ 0.80', 'por media hora']].map(([i, v, l]) =>
          <motion.div key={l} variants={sube} whileHover={{ y:-3 }}><span><Icon n={i} /></span><b>{v}</b><small>{l}</small></motion.div>)}
      </motion.div>
    </div>

    {/* Lado derecho: formulario de inicio de sesión */}
    <div className="lg-form">
      <motion.span className="lg-boceto" title="No hay conexión real: se muestran datos de ejemplo" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.8 }}><i />Modo boceto</motion.span>
      <motion.form ref={form} className="lg-card" onSubmit={enviar} noValidate
        initial={{ opacity:0, y:40, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:.8, delay:.15, ease:EASE }}>
        <img src={logo} alt="Municipalidad de San Juan de Lurigancho" />
        <div className="lg-title">
          <h3>Inicia sesión</h3>
          <p>Elige tu perfil e ingresa con tu DNI y contraseña.</p>
        </div>
        {/* Botones de perfil: administrador del sistema o personal administrativo */}
        <div className="roles" role="radiogroup" aria-label="Perfil de acceso">
          {Object.entries(ROLES).map(([k, r]) => <button key={k} type="button" role="radio" aria-checked={rol === k} className={'role' + (rol === k ? ' on' : '') + ' r-' + k} onClick={() => elegir(k)}>
            {rol === k && <motion.span layoutId="role-on" className="role-bg" transition={{ type:'spring', stiffness:480, damping:36 }} />}
            <span className="role-ic"><Icon n={r.icon} /></span>
            <span className="role-t"><b>{r.login || r.nombre}</b>{!r.login && <small>{r.desc}</small>}</span>
            <span className="role-ck"><Icon n="check" size={13} /></span>
          </button>)}
        </div>
        <div className={'lg-f' + (err.dni ? ' bad' : '')}>
          <label htmlFor="lgDni">DNI</label>
          <div className="inp"><span><Icon n="idcard" /></span>
            <input id="lgDni" inputMode="numeric" autoComplete="username" maxLength={8} placeholder="Ingresa tus 8 dígitos" value={dni}
              onChange={e => { setDni(e.target.value.replace(/\D/g, '')); setErr(x => ({ ...x, dni:false })); }} /></div>
          <AnimatePresence>{err.dni && <motion.span className="err" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>El DNI debe tener 8 dígitos.</motion.span>}</AnimatePresence>
        </div>
        <div className={'lg-f' + (err.pass ? ' bad' : '')}>
          <label htmlFor="lgPass">Contraseña</label>
          <div className="inp"><span><Icon n="lock" /></span>
            <input id="lgPass" type={ver ? 'text' : 'password'} autoComplete="current-password" placeholder="Tu contraseña" value={pass}
              onChange={e => { setPass(e.target.value); setErr(x => ({ ...x, pass:false })); }} />
            <button type="button" className="eye" onClick={() => setVer(v => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} title={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              <AnimatePresence mode="wait" initial={false}><motion.span key={ver ? 1 : 0} initial={{ opacity:0, rotate:-30, scale:.7 }} animate={{ opacity:1, rotate:0, scale:1 }} exit={{ opacity:0, rotate:30, scale:.7 }} transition={{ duration:.15 }}><Icon n={ver ? 'eyeoff' : 'eye'} /></motion.span></AnimatePresence>
            </button></div>
          <AnimatePresence>{err.pass && <motion.span className="err" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>Ingresa tu contraseña.</motion.span>}</AnimatePresence>
        </div>
        <div className="lg-opts">
          <label className="chk"><input type="checkbox" defaultChecked /><span />Recordar mi DNI</label>
          <button type="button" className="lnk" onClick={() => toast('Pide a la Subgerencia de Transporte que restablezca tu contraseña')}>¿Olvidaste tu contraseña?</button>
        </div>
        {/* Botón de ingreso: cambia a «Verificando…» con un círculo de carga mientras entra */}
        <motion.button className={'lg-btn' + (busy ? ' busy' : '')} type="submit" whileHover={{ y:-2 }} whileTap={{ scale:.98 }}>
          <span className="shine" />
          <AnimatePresence mode="wait" initial={false}>
            {busy ? <motion.span key="b" className="lg-btn-in" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}><span className="spin" />Verificando…</motion.span>
              : <motion.span key={'a' + rol} className="lg-btn-in" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>{rol === 'admin' ? 'Ingresar como administrador' : 'Ingresar al panel'}<span className="arr"><Icon n="arrow" /></span></motion.span>}
          </AnimatePresence>
        </motion.button>
        <p className="lg-hint"><Icon n="info" />Es un boceto: elige un perfil y pulsa ingresar para ver su vista con datos de ejemplo.</p>
      </motion.form>
      <motion.p className="lg-safe" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}><Icon n="shield" />Acceso exclusivo para personal autorizado de la municipalidad</motion.p>
      <footer className="lg-foot">© 2026 Municipalidad de San Juan de Lurigancho · Subgerencia de Transporte</footer>
    </div>
  </motion.section>;
}
