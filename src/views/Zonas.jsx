/* Zonas.jsx: «Zonas y tarifa». Precio por fracción, duración de la fracción, tolerancia, QR de cobro y lista de zonas.
   Cuando exista el servidor, estos valores se enviarán a todas las apps de campo. */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Card, CardHead, Pill, Who, useUI, EASE } from '../components/ui.jsx';
import { CAP, COBR, ZONAS, money } from '../data.js';

export default function Zonas(){
  const { toast } = useUI();
  // Valores de la tarifa tal como se escriben en los campos
  const [monto, setMonto] = useState('0.80'), [frac, setFrac] = useState('30'), [tol, setTol] = useState('0');
  const m = parseFloat(monto) || 0, f = Math.max(1, parseInt(frac) || 1), tl = Math.max(0, parseInt(tol) || 0);
  // Misma fórmula que la app: dentro de la tolerancia no se cobra; luego, cada fracción iniciada × monto
  const cobro = mins => mins <= tl ? 0 : Math.max(1, Math.ceil(mins / f)) * m;
  // Ejemplos que se recalculan mientras se escribe la tarifa
  const ej = [[10, '10 min'], [60, '1 h'], [70, '1 h 10 min'], [150, '2 h 30 min']];

  return <>
    <div className="g2b">
      {/* Tarifa con sus ejemplos (el monto cambia con una pequeña animación) */}
      <Card i={0}>
        <CardHead title="Tarifa" sub="Se aplica en todas las apps de campo al sincronizar" />
        <div className="card-b tarifa">
          <div className="field"><label>Monto por fracción (S/)</label><input inputMode="decimal" value={monto} onChange={e => setMonto(e.target.value)} /></div>
          <div className="field"><label>Fracción (minutos)</label><input inputMode="numeric" value={frac} onChange={e => setFrac(e.target.value)} /></div>
          <div className="field"><label>Tolerancia (minutos)</label><input inputMode="numeric" value={tol} onChange={e => setTol(e.target.value)} /></div>
          <div className="ejemplos">
            <span className="ej-t"><Icon n="info" size={16} />Así cobrará la app</span>
            <div className="ej-l">{ej.map(([mins, l]) => <div key={l} className="ej"><small>{l}</small>
              <AnimatePresence mode="popLayout" initial={false}><motion.b key={cobro(mins)} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:.2 }}>{money(cobro(mins))}</motion.b></AnimatePresence>
            </div>)}</div>
          </div>
          <div className="tarifa-f"><button className="btn btn-pri" onClick={() => toast('Boceto: el cambio no se guarda')}>Guardar tarifa</button></div>
        </div>
      </Card>
      {/* QR de cobro (subir la imagen todavía no está activo en el boceto) */}
      <Card i={1}>
        <CardHead title="QR de cobro" sub="Imagen que ve el conductor al pagar" />
        <div className="card-b qr-box">
          <motion.button className="qr-drop" whileHover={{ scale:1.03 }} whileTap={{ scale:.98 }} onClick={() => toast('Boceto: subir imagen no está activo')}>
            <Icon n="qr" size={40} /><span>Subir QR</span>
          </motion.button>
          <div style={{ display:'grid', gap:10 }}>
            <p className="muted" style={{ margin:0, fontSize:13 }}>Sube el QR de Yape / Plin de la cuenta municipal. Se enviará a todas las apps de campo.</p>
            <span><button className="btn btn-yel" onClick={() => toast('Boceto: subir imagen no está activo')}><Icon n="upload" />Elegir imagen</button></span>
          </div>
        </div>
      </Card>
    </div>
    {/* Lista de zonas con su cantidad de espacios y su cobrador */}
    <Card i={2}>
      <CardHead title="Zonas de estacionamiento" sub={`${ZONAS.length} zonas · ${CAP} espacios en total`}>
        <button className="btn btn-pri" onClick={() => toast('Boceto: crear zona no está activo')}><Icon n="plus" />Nueva zona</button>
      </CardHead>
      <div className="card-b"><div className="tbl-w"><table>
        <thead><tr><th>Zona</th><th className="r">Espacios</th><th>Cobrador asignado</th><th>Estado</th><th /></tr></thead>
        <tbody>{ZONAS.map((z, i) => <motion.tr key={z.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 + i * .03, ease:EASE }}>
          <td><b>{z.n}</b></td><td className="r tnum">{z.cap}</td><td><Who c={COBR[Math.floor(z.id / 2)]} /></td><td><Pill k="ok">Habilitada</Pill></td>
          <td className="r"><button className="btn btn-txt" onClick={() => toast('Boceto: editar zona no está activo')}><Icon n="edit" size={16} />Editar</button></td>
        </motion.tr>)}</tbody>
      </table></div></div>
    </Card>
  </>;
}
