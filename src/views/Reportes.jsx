// Reportes.jsx: descargas para control y rendición (solo administrador). En el boceto las descargas no están activas.
import { motion } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Card, useUI, EASE } from '../components/ui.jsx';
import { AHORA, COBR, ZONAS } from '../data.js';

// Cada reporte: [ícono, color, título, descripción]
const ITEMS = [
  ['coins', 'yel', 'Recaudación diaria', 'Totales por día con QR, efectivo y deudas; listo para rendición de caja.'],
  ['users', 'blue', 'Liquidación por cobrador', 'Lo que cobró cada trabajador, por turno y medio de pago.'],
  ['pin', 'blue', 'Ocupación por zona', 'Uso de cada zona por hora y promedio de permanencia.'],
  ['alert', 'red', 'Deudas pendientes', 'Placas que se retiraron sin pagar y deudas recuperadas.'],
  ['list', 'green', 'Detalle de movimientos', 'Todos los registros con placa, horas, espacio y N° de operación.'],
  ['send', 'yel', 'Envío automático', 'Programa el envío del resumen diario por correo a la gerencia.']
];
// Fecha en formato AAAA-MM-DD, el que necesitan los campos de tipo fecha
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Reportes(){
  const { toast } = useUI();
  const no = () => toast('Boceto: la descarga no está activa');
  return <>
    {/* Filtros: desde el 1 del mes hasta hoy, zona y cobrador */}
    <Card i={0} className="rep-f">
      <div className="field"><label>Desde</label><input type="date" defaultValue={iso(new Date(AHORA.getFullYear(), AHORA.getMonth(), 1))} /></div>
      <div className="field"><label>Hasta</label><input type="date" defaultValue={iso(AHORA)} /></div>
      <div className="field" style={{ minWidth:260 }}><label>Zona</label><select><option>Todas las zonas</option>{ZONAS.map(z => <option key={z.id}>{z.n}</option>)}</select></div>
      <div className="field" style={{ minWidth:220 }}><label>Cobrador</label><select><option>Todos</option>{COBR.map(c => <option key={c.dni}>{c.nombre}</option>)}</select></div>
    </Card>
    <div className="reps">
      {ITEMS.map(([i, cl, t, d], k) => <motion.div key={t} className="card rep" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 + k * .06, duration:.5, ease:EASE }}
        whileHover={{ y:-4 }}>
        <span className={'ic rep-ic ' + cl}><Icon n={i} /></span>
        <div><h3>{t}</h3><p>{d}</p></div>
        <div className="rep-b"><button className="btn btn-out" onClick={no}><Icon n="download" />Excel</button><button className="btn btn-out" onClick={no}><Icon n="file" />PDF</button></div>
      </motion.div>)}
    </div>
  </>;
}
