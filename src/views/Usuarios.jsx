/* Usuarios.jsx: gestión de las cuentas.
   Dos pestañas: personal de campo (usa la app) y personal administrativo (usa el panel).
   Se puede buscar, crear, editar, activar o desactivar y restablecer la contraseña (en el boceto los cambios no se guardan al recargar). */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Card, CountUp, Modal, Pill, Who, useUI, EASE } from '../components/ui.jsx';
import { ADMINS, COBR, ROLES, SESION_DEMO, ZONAS } from '../data.js';

// Pestañas: [tipo, ícono, título, descripción]; COLORES para el avatar de los usuarios nuevos; ULTIMA = versión actual de la app
const TABS = [['campo', 'car', 'Personal de campo', 'Usan la app en el celular'], ['web', 'grid', 'Personal administrativo', 'Usan solo el panel web']];
const COLORES = [['#E3EFFA', '#0F4C80'], ['#FFF4D2', '#6B4C00'], ['#ECF6DD', '#3F7A10'], ['#FDE7F1', '#9E0D55'], ['#E1F3F5', '#0A5862']];
const ULTIMA = '1.4.2';

// Interruptor de acceso (activo / desactivado). Si está bloqueado, el texto «motivo» explica por qué
function Switch({ on, onChange, disabled, label, motivo = 'No puedes desactivar tu propia cuenta' }){
  return <button type="button" role="switch" aria-checked={on} aria-label={label} title={disabled ? motivo : label}
    className={'sw-t' + (on ? ' on' : '')} disabled={disabled} onClick={() => onChange(!on)}>
    <motion.span className="sw-k" layout transition={{ type:'spring', stiffness:700, damping:32 }} />
  </button>;
}

export default function Usuarios(){
  const { toast, rol } = useUI();
  // DNI de quien tiene la sesión abierta: su propia cuenta no se puede desactivar
  const yo = SESION_DEMO[rol].dni;
  // El personal administrativo no puede modificar cuentas de administradores
  const protegido = u => rol !== 'admin' && u.rol === 'admin';
  // Copias editables de los usuarios (los cambios viven solo mientras la página está abierta)
  const [campo, setCampo] = useState(() => COBR.map(c => ({ ...c })));
  const [web, setWeb] = useState(() => ADMINS.map(a => ({ ...a })));
  const [tab, setTab] = useState('campo');
  const [q, setQ] = useState('');
  // Estado del formulario: abierto o no, usuario que se edita (null = nuevo) y tipo
  const [m, setM] = useState({ open:false, u:null, tipo:'campo' });

  const lista = tab === 'campo' ? campo : web;
  // Búsqueda por nombre o DNI dentro de la pestaña activa
  const filtrada = useMemo(() => { const s = q.trim().toLowerCase(); return s ? lista.filter(u => u.nombre.toLowerCase().includes(s) || u.dni.includes(s)) : lista; }, [lista, q]);
  const todos = [...campo, ...web];

  // Actualiza un usuario en su lista (campo o web)
  const set = (tipo, dni, cambios) => (tipo === 'campo' ? setCampo : setWeb)(l => l.map(u => u.dni === dni ? { ...u, ...cambios } : u));
  const activar = (u, on) => { set(u.tipo, u.dni, { activo:on }); toast(`${u.nombre.split(' ')[0]} ${on ? 'puede ingresar de nuevo' : 'ya no podrá ingresar'} (boceto: no se guarda)`); };
  const abrir = (u, tipo = tab) => setM({ open:true, u, tipo:u ? u.tipo : tipo });
  // Guardar desde el formulario: edita el usuario existente o agrega uno nuevo con un color de avatar
  const guardar = datos => {
    const lista = datos.tipo === 'campo' ? campo : web, [col, tx] = COLORES[lista.length % COLORES.length];
    if (m.u) set(m.u.tipo, m.u.dni, datos);
    else (datos.tipo === 'campo' ? setCampo : setWeb)(l => [...l, { col, tx, ultimo:'Nunca', sync:'Nunca', cel:'Sin vincular', ver:'', ...datos }]);
    setTab(datos.tipo); setM(x => ({ ...x, open:false }));
    toast(m.u ? 'Usuario actualizado (boceto: no se guarda al recargar)' : 'Usuario creado (boceto: no se guarda al recargar)');
  };

  return <>
    {/* Indicadores: total, personal de campo, personal administrativo y desactivados */}
    <div className="kpis">
      {[['users', 'blue', 'Usuarios registrados', todos.length, 'en la app y en el panel'], ['car', 'yel', 'Personal de campo', campo.length, 'usan la app en el celular'],
        ['grid', 'green', 'Personal administrativo', web.length, `${web.filter(u => u.rol === 'admin').length} administradores del sistema`], ['lock', 'red', 'Desactivados', todos.filter(u => !u.activo).length, 'no pueden ingresar']].map(([i, c, t, v, d], k) =>
        <Card key={t} i={k} className="kpi"><span className="lb"><span className={'ic ' + c}><Icon n={i} /></span>{t}</span><b><CountUp value={v} duration={.6} /></b><span className="dt">{d}</span></Card>)}
    </div>

    <Card i={4}>
      {/* Pestañas, buscador y botón «Nuevo usuario» */}
      <div className="u-head">
        <div className="u-tabs" role="tablist">
          {TABS.map(([k, i, t, d]) => <button key={k} role="tab" aria-selected={tab === k} className={'u-tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>
            {tab === k && <motion.span layoutId="u-tab" className="u-tab-bg" transition={{ type:'spring', stiffness:480, damping:38 }} />}
            <span className="u-tab-ic"><Icon n={i} size={18} /></span>
            <span className="u-tab-t"><b>{t} <em>{k === 'campo' ? campo.length : web.length}</em></b><small>{d}</small></span>
          </button>)}
        </div>
        <label className="search u-q"><Icon n="search" size={17} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o DNI" style={{ textTransform:'none' }} /></label>
        <motion.button className="btn btn-pri" whileTap={{ scale:.97 }} onClick={() => abrir(null)}><Icon n="plus" />Nuevo usuario</motion.button>
      </div>

      <div className="tbl-w" style={{ borderTop:'1px solid var(--line)' }}>
        <AnimatePresence mode="wait" initial={false}>
          {/* La tabla cambia de columnas según la pestaña: de campo (zonas, celular, versión) o administrativo (perfil, cargo) */}
          <motion.table key={tab} initial={{ opacity:0, x:tab === 'campo' ? -16 : 16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:tab === 'campo' ? 16 : -16 }} transition={{ duration:.22, ease:EASE }}>
            {tab === 'campo'
              ? <thead><tr><th>Nombre</th><th>DNI</th><th>Zonas asignadas</th><th>Celular · app</th><th>Última sincronización</th><th>Acceso</th><th /></tr></thead>
              : <thead><tr><th>Nombre</th><th>DNI</th><th>Perfil</th><th>Cargo</th><th>Último ingreso</th><th>Acceso</th><th /></tr></thead>}
            <tbody><AnimatePresence initial={false}>{filtrada.map((u, i) => <motion.tr key={u.dni} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0, transition:{ delay:i * .03 } }} exit={{ opacity:0 }} className={u.activo ? '' : 'off'}>
              <td><Who c={u} />{u.dni === yo && <span className="tu">Tú</span>}</td>
              <td className="tnum">{u.dni}</td>
              {tab === 'campo' ? <>
                <td className="muted">{u.zonas.length ? u.zonas.map(z => <div key={z}>{ZONAS[z].n}</div>) : <span className="muted">Sin zonas</span>}</td>
                <td><span className="dev"><Icon n="car" size={15} />{u.cel}</span>{u.ver && <span className={'ver' + (u.ver !== ULTIMA ? ' old' : '')} title={u.ver !== ULTIMA ? 'Versión antigua: pedir que actualice la app' : 'Versión al día'}>v{u.ver}</span>}</td>
                <td className="tnum muted">{u.sync}</td>
              </> : <>
                <td><span className={'rol-pill sm r-' + u.rol}><Icon n={ROLES[u.rol].icon} size={13} />{ROLES[u.rol].nombre}</span></td>
                <td className="muted">{u.cargo}</td>
                <td className="tnum muted">{u.ultimo}</td>
              </>}
              <td><span className="acc"><Switch on={u.activo} onChange={on => activar(u, on)} disabled={u.dni === yo || protegido(u)} motivo={protegido(u) ? 'Solo un administrador puede modificar esta cuenta' : undefined} label={u.activo ? 'Desactivar acceso' : 'Activar acceso'} /><small>{u.activo ? 'Activo' : 'Desactivado'}</small></span></td>
              {/* Acciones: si es una cuenta protegida, solo se muestra «Solo administrador» */}
              <td className="r">{protegido(u) ? <span className="solo-admin" title="Solo un administrador puede modificar esta cuenta"><Icon n="shield" size={14} />Solo administrador</span> : <span className="acts">
                <button className="btn btn-txt" onClick={() => toast(`Boceto: se enviaría una contraseña temporal a ${u.nombre.split(' ')[0]}`)} title="Restablecer contraseña"><Icon n="lock" size={16} /></button>
                <button className="btn btn-txt" onClick={() => abrir(u)}><Icon n="edit" size={16} />Editar</button>
              </span>}</td>
            </motion.tr>)}</AnimatePresence>
            {!filtrada.length && <tr><td colSpan={7} className="vacio"><Icon n="search" size={28} /><b>No hay usuarios con «{q}»</b><span>Busca por nombre o por número de DNI.</span></td></tr>}
            </tbody>
          </motion.table>
        </AnimatePresence>
      </div>
    </Card>

    <FormUsuario m={m} rol={rol} onClose={() => setM(x => ({ ...x, open:false }))} onSave={guardar} />
  </>;
}

/* Formulario de usuario: los campos cambian según sea personal de campo o administrativo */
function FormUsuario({ m, rol, onClose, onSave }){
  const [tipo, setTipo] = useState(m.tipo), [k, setK] = useState(0);
  // Cada vez que el formulario se abre, se reinicia: toma el tipo del usuario y k cambia para limpiar los campos
  const [prev, setPrev] = useState(m);
  if (prev !== m){ setPrev(m); if (m.open && !prev.open){ setTipo(m.tipo); setK(x => x + 1); } }
  const u = m.u;

  // Al guardar: nombre obligatorio y DNI de 8 dígitos. El personal administrativo solo puede crear el perfil 'staff'
  const enviar = e => {
    e.preventDefault();
    const f = new FormData(e.currentTarget), dni = String(f.get('dni') || '');
    if (!String(f.get('nombre')).trim() || !/^\d{8}$/.test(dni)) return e.currentTarget.reportValidity();
    const base = { tipo, nombre:String(f.get('nombre')).trim(), dni, activo:f.get('estado') === 'on' };
    onSave(tipo === 'campo' ? { ...base, zonas:f.getAll('zona').map(Number) } : { ...base, rol:rol === 'admin' ? f.get('rol') : 'staff', cargo:String(f.get('cargo') || '').trim() || 'Subgerencia de Transporte' });
  };

  return <Modal open={m.open} onClose={onClose} title={u ? 'Editar usuario' : 'Nuevo usuario'}>
    <form onSubmit={enviar} key={k}>
      <div className="modal-b">
        {/* Al crear (no al editar) se elige si es de campo o administrativo */}
        {!u && <div className="field full"><label>Tipo de usuario</label>
          <div className="tipo-sel">{TABS.map(([t, i, n, d]) => <button type="button" key={t} className={'tipo' + (tipo === t ? ' on' : '')} onClick={() => setTipo(t)}>
            {tipo === t && <motion.span layoutId="tipo-on" className="tipo-bg" transition={{ type:'spring', stiffness:480, damping:36 }} />}
            <Icon n={i} size={18} /><span><b>{n}</b><small>{d}</small></span></button>)}</div></div>}
        <div className="field full"><label htmlFor="uNom">Nombre completo</label><input id="uNom" name="nombre" required defaultValue={u ? u.nombre : ''} placeholder="Nombres y apellidos" /></div>
        <div className="field"><label htmlFor="uDni">DNI</label><input id="uDni" name="dni" required pattern="\d{8}" title="8 dígitos" inputMode="numeric" maxLength={8} defaultValue={u ? u.dni : ''} placeholder="12345678" /></div>
        <div className="field"><label htmlFor="uPass">{u ? 'Nueva contraseña' : 'Contraseña inicial'}</label><input id="uPass" type="password" placeholder={u ? 'Déjala vacía para no cambiarla' : 'Se le pedirá cambiarla'} /></div>
        <AnimatePresence mode="wait" initial={false}>
          {/* Campos según el tipo: zonas (campo) o perfil y cargo (administrativo). El perfil de administrador aparece bloqueado con candado para el personal administrativo */}
          <motion.div key={tipo} className="full tipo-campos" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.18 }}>
            {tipo === 'campo'
              ? <div className="field"><label>Zonas asignadas</label>
                  <div className="zsel">{ZONAS.map(z => <label key={z.id} className="zopt"><input type="checkbox" name="zona" value={z.id} defaultChecked={!!u && u.tipo === 'campo' && u.zonas.includes(z.id)} /><span>{z.n}</span></label>)}</div></div>
              : <>
                  <div className="field"><label>Perfil en el panel</label>
                    <div className="rol-sel">{Object.entries(ROLES).map(([r, x]) => { const bloq = r === 'admin' && rol !== 'admin';
                      return <label key={r} className={'rol-op r-' + r + (bloq ? ' locked' : '')} title={bloq ? 'Solo un administrador del sistema puede asignar este perfil' : undefined}><input type="radio" name="rol" value={r} disabled={bloq} defaultChecked={u && u.tipo === 'web' ? u.rol === r : r === 'staff'} />
                      <span className="rol-op-ic"><Icon n={x.icon} size={17} /></span><span><b>{x.nombre}</b><small>{bloq ? 'Solo un administrador del sistema puede asignarlo' : r === 'admin' ? 'Ve todo, incluidos Reportes y Actividad' : 'Opera el día a día y gestiona usuarios y zonas'}</small></span>{bloq && <span className="rol-lock"><Icon n="lock" size={14} /></span>}</label>; })}</div></div>
                  <div className="field"><label htmlFor="uCar">Cargo o área</label><input id="uCar" name="cargo" defaultValue={u && u.tipo === 'web' ? u.cargo : ''} placeholder="Por ejemplo: Caja y rendición" /></div>
                </>}
          </motion.div>
        </AnimatePresence>
        <div className="field full"><label htmlFor="uEst">Acceso</label><select id="uEst" name="estado" defaultValue={u && !u.activo ? 'off' : 'on'}>
          <option value="on">Activo: puede ingresar {tipo === 'campo' ? 'a la app' : 'al panel'}</option><option value="off">Desactivado: no puede ingresar</option></select></div>
      </div>
      <div className="modal-f"><button type="button" className="btn btn-out" onClick={onClose}>Cancelar</button><button className="btn btn-pri" type="submit">{u ? 'Guardar cambios' : 'Crear usuario'}</button></div>
    </form>
  </Modal>;
}
