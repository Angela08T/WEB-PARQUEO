/* App.jsx: estructura general del panel.
   Controla el inicio de sesión, el menú lateral según el perfil, la barra superior,
   la sección que se muestra (según la dirección: #resumen, #deudas…), la búsqueda rápida y los avisos. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import Icon from './components/Icon.jsx';
import Login from './components/Login.jsx';
import { EASE, UI, Modal, Plate, PillEstado } from './components/ui.jsx';
import { AHORA, T, ZONAS, ROLES, SESION_DEMO, hhmm, ini, money } from './data.js';
import logo from '../../app-movil/recursos/logo-sjl.png';
// Una pantalla por cada sección del menú (carpeta views/)
import Resumen from './views/Resumen.jsx';
import Vivo from './views/Vivo.jsx';
import Movimientos from './views/Movimientos.jsx';
import Deudas from './views/Deudas.jsx';
import Cobradores from './views/Cobradores.jsx';
import Zonas from './views/Zonas.jsx';
import Reportes from './views/Reportes.jsx';
import Usuarios from './views/Usuarios.jsx';
import Actividad from './views/Actividad.jsx';
import Cierres from './views/Cierres.jsx';
import Mapa from './views/Mapa.jsx';

// Cantidad de deudas pendientes: se muestra como contador rojo junto a «Deudas» en el menú
const DEUDAS = T.filter(t => t.estado === 'pendiente').length;
// Secciones del panel. Para cada una: t = título, s = subtítulo (función, por si depende de la fecha), C = pantalla
const VIEWS = {
  resumen:{ t:'Resumen del día', s:() => 'Hoy, ' + AHORA.toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long' }), C:Resumen },
  vivo:{ t:'Ocupación en vivo', s:() => 'Espacios ocupados en las 12 zonas, ahora mismo', C:Vivo },
  movimientos:{ t:'Movimientos', s:() => 'Ingresos, pagos y deudas registrados por los cobradores', C:Movimientos },
  deudas:{ t:'Deudas', s:() => 'Vehículos que se retiraron sin pagar', C:Deudas },
  cobradores:{ t:'Cobradores', s:() => 'Personal de campo con acceso a la app SICOE', C:Cobradores },
  cierres:{ t:'Cierres de turno', s:() => 'Cuadre de caja que cada cobrador hace al terminar su turno en la app', C:Cierres },
  mapa:{ t:'Ubicaciones', s:() => 'Dónde se registró cada ingreso y cobro de hoy', C:Mapa },
  usuarios:{ t:'Usuarios', s:() => 'Personal de campo (app móvil) y administrativo (panel web)', C:Usuarios },
  actividad:{ t:'Actividad del sistema', s:() => 'Todo lo que pasa en el panel y en las apps de campo', C:Actividad },
  zonas:{ t:'Zonas y tarifa', s:() => 'Configuración que reciben todas las apps de campo', C:Zonas },
  reportes:{ t:'Reportes', s:() => 'Descarga la información para control y rendición', C:Reportes }
};
/* Grupos del menú lateral: [nombre del grupo, [[sección, ícono, texto, extra]]].
   «extra» puede ser 'live' (punto verde parpadeante) o un número (contador) */
const OPERACION = ['Operación', [['resumen', 'grid', 'Resumen'], ['vivo', 'radio', 'Ocupación en vivo', 'live'], ['movimientos', 'list', 'Movimientos'], ['deudas', 'alert', 'Deudas', DEUDAS]]];
const CONTROL = ['Control', [['cierres', 'wallet', 'Cierres de turno'], ['mapa', 'map', 'Ubicaciones']]];
/* Menú según el perfil: el administrador del sistema ve todo; el personal administrativo, todo menos Reportes y Actividad */
const ADMINISTRACION = [['usuarios', 'users', 'Usuarios'], ['cobradores', 'car', 'Cobradores'], ['zonas', 'pin', 'Zonas y tarifa']];
const NAV = {
  admin:[OPERACION, CONTROL, ['Administración', [...ADMINISTRACION, ['reportes', 'file', 'Reportes']]], ['Sistema', [['actividad', 'clock', 'Actividad']]]],
  staff:[OPERACION, CONTROL, ['Administración', ADMINISTRACION]]
};
// Indica si un perfil puede abrir una sección (la sección debe estar en su menú)
const permitido = (rol, v) => NAV[rol].some(([, items]) => items.some(([k]) => k === v));
// Notificaciones de ejemplo de la campana: [ícono, color, texto, hace cuánto]
const NOTIS = [
  ['alert', 'red', 'JR. WIRACOCHA 2 IMPAR llegó a 90% de ocupación', 'hace 4 min'],
  ['car', 'blue', 'BPY-660 volvió con una deuda de S/ 1.60', 'hace 12 min'],
  ['users', 'green', 'Carlos Mamani inició turno en la app', 'hace 1 h']
];
// Sección actual según la dirección (#resumen, #vivo…); si no existe, vuelve al Resumen
const leerHash = () => VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : 'resumen';
// Perfil guardado mientras dure la pestaña del navegador (sessionStorage); por defecto, personal administrativo
const leerRol = () => { try { return sessionStorage.getItem('sicoe-rol') || 'staff'; } catch { return 'staff'; } };

/* Tema claro / oscuro. Si nadie lo eligió, sigue la configuración del sistema;
   la elección se recuerda en el navegador (localStorage) y se aplica con el atributo data-theme */
function useTema(){
  const sis = () => matchMedia('(prefers-color-scheme: dark)').matches;
  const [tema, setTema] = useState(() => { try { return localStorage.getItem('sicoe-tema') || ''; } catch { return ''; } });
  const dark = tema ? tema === 'dark' : sis();
  useEffect(() => {
    if (tema) document.documentElement.dataset.theme = tema; else delete document.documentElement.dataset.theme;
    try { tema ? localStorage.setItem('sicoe-tema', tema) : localStorage.removeItem('sicoe-tema'); } catch {}
  }, [tema]);
  return [dark, () => setTema(dark ? 'light' : 'dark')];
}

// Componente principal: decide si mostrar el inicio de sesión o el panel
export default function App(){
  // Si la dirección ya trae una sección (#deudas), se entra directo sin pasar por el inicio de sesión
  const [logged, setLogged] = useState(() => location.hash.length > 1);
  const [rol, setRol] = useState(leerRol);
  const [view, setView] = useState(leerHash);
  // Estado de la interfaz: aviso inferior, buscador, notificaciones, menú del celular y sombra de la barra superior
  const [toastMsg, setToastMsg] = useState(null);
  const [buscar, setBuscar] = useState(false);
  const [notis, setNotis] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, cambiarTema] = useTema();
  const tRef = useRef();

  // toast(mensaje): muestra un aviso abajo durante 2,6 segundos. Las pantallas lo usan con useUI()
  const toast = useCallback(m => { setToastMsg({ m, k:Date.now() }); clearTimeout(tRef.current); tRef.current = setTimeout(() => setToastMsg(null), 2600); }, []);
  // Lo que se comparte con todas las pantallas a través del contexto UI: la función toast y el perfil
  const ui = useMemo(() => ({ toast, rol }), [toast, rol]);
  // Al iniciar sesión: guarda el perfil elegido y muestra el panel
  const entrar = r => { setRol(r); try { sessionStorage.setItem('sicoe-rol', r); } catch {} setLogged(true); };

  // Si el perfil no tiene acceso a la sección, vuelve al resumen
  useEffect(() => {
    if (logged && !permitido(rol, view)){
      if (location.hash.length > 1) toast('Tu perfil no tiene acceso a esa sección');
      history.replaceState(null, '', '#resumen'); setView('resumen');
    }
  }, [logged, rol, view]);

  useEffect(() => {
    // Escucha: cambio de sección (hashchange), desplazamiento (sombra de la barra) y el atajo Ctrl + K del buscador
    const h = () => { setView(leerHash()); setMenu(false); scrollTo({ top:0 }); };
    const s = () => setScrolled(scrollY > 4);
    const k = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); setBuscar(true); } };
    addEventListener('hashchange', h); addEventListener('scroll', s); addEventListener('keydown', k);
    return () => { removeEventListener('hashchange', h); removeEventListener('scroll', s); removeEventListener('keydown', k); };
  }, []);

  // Sección a dibujar (si el perfil no tiene permiso, el Resumen) y menú lateral (se usa en PC y en el menú del celular)
  const V = VIEWS[permitido(rol, view) ? view : 'resumen'];
  const side = <Sidebar view={view} rol={rol} onLogout={() => { setLogged(false); setMenu(false); }} />;

  {/* Si la persona pidió «reducir movimiento» en su sistema, las animaciones se suavizan */}
  return <MotionConfig reducedMotion="user">
    <UI.Provider value={ui}>
      {/* Inicio de sesión: se desvanece al entrar */}
      <AnimatePresence>{!logged && <Login key="login" onEnter={entrar} />}</AnimatePresence>

      {logged && <div className="shell">
        {/* Menú lateral fijo (PC) */}
        <motion.aside className="side" initial={{ x:-40, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ duration:.6, ease:EASE }}>{side}</motion.aside>
        {/* Menú lateral deslizable (celular), con fondo oscuro que lo cierra al tocarlo */}
        <AnimatePresence>{menu && <>
          <motion.div className="drawer-scrim" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setMenu(false)} />
          <motion.aside className="side drawer" initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }} transition={{ type:'spring', stiffness:380, damping:38 }}>{side}</motion.aside>
        </>}</AnimatePresence>

        <div className="main">
          {/* Barra superior: botón de menú (celular), título de la sección, buscador, perfil, tema y notificaciones */}
          <header className={'top' + (scrolled ? ' sc' : '')}>
            <button className="ibtn menu-b" onClick={() => setMenu(true)} aria-label="Abrir menú"><Icon n="menu" /></button>
            <div className="grow">
              <AnimatePresence mode="wait">
                <motion.div key={view} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.25, ease:EASE }}>
                  <h2>{V.t}</h2><p>{V.s()}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <button className="qsearch" onClick={() => setBuscar(true)}><Icon n="search" size={17} /><span>Buscar placa</span><kbd>Ctrl K</kbd></button>
            <span className={'rol-pill r-' + rol}><Icon n={ROLES[rol].icon} size={15} />{ROLES[rol].corto}</span>
            <motion.button className="ibtn" onClick={cambiarTema} title="Cambiar tema" aria-label="Cambiar tema" whileTap={{ scale:.9 }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={dark ? 's' : 'm'} style={{ display:'grid' }} initial={{ rotate:-90, opacity:0, scale:.6 }} animate={{ rotate:0, opacity:1, scale:1 }} exit={{ rotate:90, opacity:0, scale:.6 }} transition={{ duration:.25 }}>
                  <Icon n={dark ? 'sun' : 'moon'} />
                </motion.span>
              </AnimatePresence>
            </motion.button>
            {/* Campana de notificaciones con su ventana desplegable */}
            <div className="pop-w">
              <motion.button className="ibtn" onClick={() => setNotis(o => !o)} title="Notificaciones" aria-label="Notificaciones" aria-expanded={notis} whileTap={{ scale:.9 }}>
                <Icon n="bell" /><span className="dot" />
              </motion.button>
              <AnimatePresence>{notis && <>
                <div className="pop-out" onClick={() => setNotis(false)} />
                <motion.div className="pop" initial={{ opacity:0, y:-8, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-6, scale:.97 }} transition={{ type:'spring', stiffness:500, damping:34 }}>
                  <div className="pop-h"><b>Notificaciones</b><span className="pill on" style={{ marginLeft:'auto' }}>3 nuevas</span></div>
                  {NOTIS.map(([i, c, t, h], k) => <motion.div key={k} className="pop-i" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:.05 + k * .05 }}>
                    <span className={'ic ' + c}><Icon n={i} size={16} /></span><div><span>{t}</span><small>{h}</small></div></motion.div>)}
                </motion.div>
              </>}</AnimatePresence>
            </div>
          </header>

          {/* Contenido: la sección elegida, con una transición al cambiar de sección o de perfil */}
          <main className="content">
            <AnimatePresence mode="wait">
              <motion.div key={view + rol} className="view" initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10, transition:{ duration:.15 } }} transition={{ duration:.35, ease:EASE }}>
                <div className="boceto"><Icon n="info" />Boceto de diseño: los datos son de ejemplo y todavía no está conectado a la app de campo.</div>
                <V.C />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>}

      {/* Buscador de placas (Ctrl + K) */}
      <Buscador open={buscar} onClose={() => setBuscar(false)} />

      {/* Aviso inferior (toast) */}
      <AnimatePresence>{toastMsg && <motion.div key={toastMsg.k} className="toast" role="status"
        initial={{ opacity:0, y:24, x:'-50%', scale:.95 }} animate={{ opacity:1, y:0, x:'-50%', scale:1 }} exit={{ opacity:0, y:12, x:'-50%' }} transition={{ type:'spring', stiffness:500, damping:32 }}>
        <Icon n="info" size={18} />{toastMsg.m}</motion.div>}</AnimatePresence>
    </UI.Provider>
  </MotionConfig>;
}

/* Menú lateral: marca SICOE, grupos de secciones según el perfil, logo de la municipalidad y usuario con su botón de cerrar sesión.
   El fondo amarillo de la sección activa se desliza entre opciones gracias a layoutId="nav-on" */
function Sidebar({ view, rol, onLogout }){
  const yo = SESION_DEMO[rol];
  return <>
    <div className="brand"><span className="mk"><b>P</b></span><div><h1>SICOE</h1><small>Panel administrativo</small></div></div>
    {NAV[rol].map(([g, items]) => <div key={g}>
      <p className="nav-l">{g}</p>
      <nav className="nav">{items.map(([v, i, l, extra]) =>
        <a key={v} href={'#' + v} className={view === v ? 'on' : ''} aria-current={view === v ? 'page' : undefined}>
          {view === v && <motion.span layoutId="nav-on" className="nav-bg" transition={{ type:'spring', stiffness:450, damping:36 }}><span className="nav-bar" /></motion.span>}
          <Icon n={i} /><span className="nav-t">{l}</span>
          {extra === 'live' ? <span className="live" /> : extra ? <span className="cnt">{extra}</span> : null}
        </a>)}</nav>
    </div>)}
    <div className="side-foot">
      <div className="muni"><img src={logo} alt="Municipalidad de San Juan de Lurigancho" /></div>
      <div className="me"><span className="av" style={{ background:yo.col, color:yo.tx }}>{ini(yo.nombre)}</span><div><b>{yo.nombre.split(' ').slice(0, 2).join(' ')}</b><small>{ROLES[rol].nombre}</small></div>
        <button onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión"><Icon n="logout" /></button></div>
    </div>
  </>;
}

/* Búsqueda rápida por placa (Ctrl + K) */
function Buscador({ open, onClose }){
  const [q, setQ] = useState('');
  useEffect(() => { if (open) setQ(''); }, [open]);
  // Se compara la placa sin guion ni espacios y se muestran hasta 7 resultados
  const limpio = q.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const res = limpio.length < 2 ? [] : T.filter(t => t.placa.replace('-', '').includes(limpio)).slice(0, 7);
  return <Modal open={open} onClose={onClose} wide>
    <div className="qs-in"><Icon n="search" /><input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Escribe una placa, por ejemplo ZKY198" /><kbd>Esc</kbd></div>
    <div className="qs-res">
      {limpio.length < 2 ? <p className="qs-empty">Escribe al menos 2 caracteres de la placa.</p>
        : !res.length ? <p className="qs-empty">No hay movimientos con «{q.toUpperCase()}».</p>
        : <AnimatePresence initial={false}>{res.map((t, i) => <motion.div key={t.id} className="qs-i" layout initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i * .03 }}>
            <Plate p={t.placa} /><div className="mid"><b>{t.modelo} · {t.color}</b><small>E{t.espacio} · {ZONAS[t.zona].n} · {hhmm(t.inicio)}</small></div><PillEstado t={t} /><b className="tnum">{money(t.monto)}</b>
          </motion.div>)}</AnimatePresence>}
    </div>
  </Modal>;
}
