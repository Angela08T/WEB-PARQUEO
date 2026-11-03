/* ui.jsx: piezas de interfaz que se repiten en todas las pantallas (tarjetas, gráficos, filtros, modal, etiquetas).
   Si se cambia aquí, cambia en todo el panel. */
import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence, animate } from 'motion/react';
import Icon from './Icon.jsx';
import { ini, money, pad } from '../data.js';

// Curva de animación común: arranca rápido y frena suave
export const EASE = [0.16, 1, 0.3, 1];
// Contexto compartido: cualquier pantalla puede usar const { toast, rol } = useUI()
export const UI = createContext({ toast:() => {} });
export const useUI = () => useContext(UI);

/* Tarjeta que entra con un leve ascenso, escalonada por su posición (i) */
export function Card({ i = 0, className = '', children, ...rest }){
  return <motion.div className={'card ' + className} initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
    transition={{ duration:.55, delay:i * .06, ease:EASE }} {...rest}>{children}</motion.div>;
}

export function CardHead({ title, sub, children }){
  return <div className="card-h"><div className="grow"><h3>{title}</h3>{sub && <p>{sub}</p>}</div>{children}</div>;
}

/* Número que cuenta desde su valor anterior hasta el nuevo */
export function CountUp({ value, format = v => Math.round(v).toLocaleString('es-PE'), duration = 1.2, delay = 0 }){
  const ref = useRef(null), prev = useRef(0);
  useEffect(() => {
    // Anima desde el último valor mostrado hasta el nuevo y escribe el número directo en pantalla (sin volver a dibujar React)
    const c = animate(prev.current, value, { duration, delay, ease:EASE, onUpdate:v => { if (ref.current) ref.current.textContent = format(v); } });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return <span ref={ref} className="tnum">{format(0)}</span>;
}

/* Minigráfico de línea que se dibuja al aparecer */
export function Spark({ vals, color, delay = .3 }){
  // Convierte los valores en puntos de una línea de 92 × 34; d es el trazo y el área se rellena debajo
  const W = 92, H = 34, m = Math.max(...vals, 1), n = Math.max(vals.length - 1, 1);
  const d = 'M' + vals.map((v, i) => (i * W / n).toFixed(1) + ',' + (H - 3 - (H - 6) * v / m).toFixed(1)).join(' L');
  return <svg className="spark" viewBox={`0 0 ${W} ${H}`} style={{ color }} aria-hidden="true">
    <motion.path d={`${d} L${W},${H} L0,${H} Z`} fill="currentColor" initial={{ opacity:0 }} animate={{ opacity:.14 }} transition={{ delay:delay + .6, duration:.6 }} />
    <motion.path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength:0 }} animate={{ pathLength:1 }} transition={{ delay, duration:1.1, ease:EASE }} />
  </svg>;
}

/* Dona interactiva: al pasar sobre un segmento o su leyenda se resalta y el centro muestra su valor */
export function Donut({ parts, total, sub }){
  // Cada parte es un círculo con trazo discontinuo: su largo (strokeDasharray) es proporcional a su valor y se ubica a continuación del anterior (strokeDashoffset)
  const r = 64, C = 2 * Math.PI * r, tot = parts.reduce((s, p) => s + p.v, 0) || 1;
  const [hov, setHov] = useState(null);
  let off = 0;
  const h = hov !== null ? parts[hov] : null;
  return <div className="pay">
    <svg className="donut" viewBox="0 0 160 160" role="img" aria-label={parts.map(p => `${p.label} ${Math.round(p.v / tot * 100)}%`).join(', ')}>
      <circle className="bg" cx="80" cy="80" r={r} />
      {parts.map((p, i) => {
        const l = p.v / tot * C, g = l > 4 ? 2.5 : 0, o = off; off += l;
        return <motion.circle key={p.label} cx="80" cy="80" r={r} style={{ stroke:p.color }} transform="rotate(-90 80 80)"
          strokeDashoffset={-o} initial={{ strokeDasharray:`0 ${C}` }} animate={{ strokeDasharray:`${Math.max(l - g, 0)} ${C}`, strokeWidth:hov === i ? 20 : 15, opacity:hov === null || hov === i ? 1 : .35 }}
          transition={{ strokeDasharray:{ duration:1, delay:.25 + i * .15, ease:EASE }, default:{ duration:.2 } }}
          onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />;
      })}
      <AnimatePresence mode="wait">
        <motion.g key={hov ?? 'tot'} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }} transition={{ duration:.18 }}>
          <text x="80" y="82" textAnchor="middle">{h ? money(h.v) : total}</text>
          <text className="s" x="80" y="100" textAnchor="middle">{h ? h.label : sub}</text>
        </motion.g>
      </AnimatePresence>
    </svg>
    <div className="legend">
      {parts.map((p, i) => <div key={p.label} className={hov !== null && hov !== i ? 'dim' : ''} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
        <span className="sw" style={{ background:p.color }} />{p.label}<span className="v">{money(p.v)}</span><span className="p">{Math.round(p.v / tot * 100)}%</span>
      </div>)}
    </div>
  </div>;
}

/* Gráfico de barras: crecen al aparecer, la última (hora en curso) va en amarillo, con línea de promedio */
export function Bars({ data }){
  // id único para los degradados del SVG, por si hay más de un gráfico en la página
  const id = useId().replace(/:/g, '');
  const W = 720, H = 240, pl = 44, pb = 26, pt = 14, max = Math.max(...data.map(d => d.v), 1);
  // Escala del eje Y: busca un paso redondo (1, 2, 10, 20…) y la altura máxima del gráfico
  const mag = Math.pow(10, Math.floor(Math.log10(max))), step = mag * (max / mag > 5 ? 2 : 1);
  const top = Math.ceil(max / step) * step, y = v => pt + (H - pt - pb) * (1 - v / top);
  const bw = (W - pl) / data.length, w = Math.min(34, bw - 10);
  // Promedio solo de las horas con cobros (para la línea punteada)
  const con = data.filter(d => d.v), avg = con.length ? con.reduce((s, d) => s + d.v, 0) / con.length : 0;
  const [hov, setHov] = useState(null);
  const ticks = []; for (let v = 0; v <= top + .001; v += step) ticks.push(v);
  return <div className="chart">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Recaudación por hora">
      <defs>
        <linearGradient id={id + 'b'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor:'var(--primary)' }} /><stop offset="1" style={{ stopColor:'var(--primary-2)', stopOpacity:.7 }} /></linearGradient>
        <linearGradient id={id + 'n'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFCB3D" /><stop offset="1" stopColor="#F39200" /></linearGradient>
      </defs>
      <g className="grid">{ticks.map(v => <g key={v}><line x1={pl} x2={W} y1={y(v)} y2={y(v)} /><text className="ax" x={pl - 8} y={y(v) + 4} textAnchor="end">{v}</text></g>)}</g>
      {data.map((d, i) => {
        // Barra con esquinas superiores redondeadas; crece desde abajo (originY:1) con un pequeño retraso por posición
        const x = pl + i * bw + (bw - w) / 2, yy = y(d.v), h = Math.max(0, H - pb - yy), r = Math.min(5, h);
        return <g key={d.h}>
          {h > 0 && <motion.path d={`M${x},${H - pb} V${yy + r} Q${x},${yy} ${x + r},${yy} H${x + w - r} Q${x + w},${yy} ${x + w},${yy + r} V${H - pb} Z`}
            fill={`url(#${id}${i === data.length - 1 ? 'n' : 'b'})`} style={{ originY:1 }}
            initial={{ scaleY:0 }} animate={{ scaleY:1, opacity:hov === null || hov === i ? 1 : .35 }}
            transition={{ scaleY:{ duration:.8, delay:.2 + i * .045, ease:EASE }, opacity:{ duration:.15 } }} />}
          <text className="ax" x={x + w / 2} y={H - 8} textAnchor="middle">{pad(d.h)}:00</text>
          {/* Zona invisible de toda la columna para que el mouse active el detalle aunque la barra sea baja */}
          <rect className="hit" x={pl + i * bw} y={pt} width={bw} height={H - pt - pb} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
        </g>;
      })}
      {avg > 0 && <motion.g initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}>
        <line className="avg" x1={pl} x2={W} y1={y(avg)} y2={y(avg)} />
        <text className="avg-t" x={pl + 8} y={y(avg) - 7}>Promedio {money(avg)}</text>
      </motion.g>}
    </svg>
    <AnimatePresence>
      {hov !== null && <motion.div className="tip" key="tip" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }} transition={{ duration:.15 }}
        style={{ left:`${(pl + hov * bw + bw / 2) / W * 100}%`, top:`${y(data[hov].v) / H * 100}%` }}>
        <b>{money(data[hov].v)}</b>{pad(data[hov].h)}:00 – {pad(data[hov].h)}:59 · {data[hov].n} pagos
      </motion.div>}
    </AnimatePresence>
  </div>;
}

/* Botones de filtro con indicador que se desliza entre opciones */
export function Chips({ options, value, onChange, name }){
  return <div className="chips" role="tablist">
    {options.map(o => <button key={o} role="tab" aria-selected={value === o} className={'chip' + (value === o ? ' on' : '')} onClick={() => onChange(o)}>
      {/* El fondo oscuro de la opción elegida se desliza a la nueva opción (layoutId compartido) */}
      {value === o && <motion.span layoutId={'chip-' + name} className="chip-bg" transition={{ type:'spring', stiffness:500, damping:38 }} />}
      <span className="chip-t">{o}</span>
    </button>)}
  </div>;
}

// Ventana emergente: se cierra con Esc, con la X o al hacer clic fuera
export function Modal({ open, onClose, title, children, footer, wide }){
  useEffect(() => {
    if (!open) return;
    const k = e => e.key === 'Escape' && onClose();
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [open]);
  return <AnimatePresence>
    {open && <motion.div className="scrim" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <motion.div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}
        initial={{ opacity:0, y:24, scale:.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:12, scale:.97 }} transition={{ type:'spring', stiffness:420, damping:34 }}>
        {title && <div className="modal-h"><h3>{title}</h3><button className="ibtn ghost" onClick={onClose} aria-label="Cerrar"><Icon n="x" /></button></div>}
        {children}
        {footer && <div className="modal-f">{footer}</div>}
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
}

// Etiquetas pequeñas: Who = avatar con iniciales + nombre; Plate = placa; Pill = etiqueta de color (ok, bad, on, off, yel); PillEstado = estado de un movimiento
export const Who = ({ c }) => <span className="who"><span className="av" style={{ background:c.col, color:c.tx }}>{ini(c.nombre)}</span>{c.nombre}</span>;
export const Plate = ({ p }) => <span className="plate">{p}</span>;
export const Pill = ({ k = 'on', dot = true, children }) => <span className={'pill ' + k}>{dot && <span className="d" />}{children}</span>;
export const PillEstado = ({ t }) => t.estado === 'pagado' ? <Pill k="ok">Pagado · {t.metodo}</Pill>
  : t.estado === 'activo' ? <Pill k="on">En parqueo</Pill> : <Pill k="bad">No pagó</Pill>;

/* Barra horizontal que se llena al aparecer */
export const Fill = ({ pct, className = '', delay = 0 }) =>
  <motion.i className={className} initial={{ width:0 }} animate={{ width:pct + '%' }} transition={{ duration:.9, delay, ease:EASE }} />;
