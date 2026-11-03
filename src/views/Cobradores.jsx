// Cobradores.jsx: rendimiento del equipo de campo (solo consulta).
import { motion } from 'motion/react';
import Icon from '../components/Icon.jsx';
import { Card, CardHead, Pill, Who, EASE } from '../components/ui.jsx';
import { COBR, T, ZONAS, esHoy, money, sum } from '../data.js';

/* Equipo de campo: rendimiento del día (crear o editar cobradores se hace en Usuarios) */
export default function Cobradores(){
  // Pagos de hoy, para calcular lo recaudado por cada cobrador
  const pag = T.filter(t => esHoy(t.inicio) && t.estado === 'pagado');
  return <>
    <motion.div className="aviso" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
      <span className="ic blue"><Icon n="users" size={18} /></span>
      <div><b>Rendimiento del equipo de campo</b><span>Para crear, editar o desactivar a un cobrador, entra a <a href="#usuarios">Usuarios</a>.</span></div>
    </motion.div>
    <Card i={0}>
      <CardHead title={`${COBR.length} cobradores registrados`} sub="Ingresan a la app SICOE con su DNI y contraseña" />
      <div className="card-b"><div className="tbl-w"><table>
        <thead><tr><th>Nombre</th><th>DNI</th><th>Zonas asignadas</th><th>Última sincronización</th><th>Estado</th><th className="r">Recaudado hoy</th></tr></thead>
        <tbody>{COBR.map((c, i) => <motion.tr key={c.dni} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 + i * .05, ease:EASE }}>
          <td><Who c={c} /></td><td className="tnum">{c.dni}</td>
          <td className="muted">{c.zonas.length ? c.zonas.map(z => <div key={z}>{ZONAS[z].n}</div>) : '—'}</td>
          <td className="tnum muted">{c.sync}</td>
          <td>{c.activo ? <Pill k="ok">Activo</Pill> : <Pill k="off">Desactivado</Pill>}</td>
          <td className="r tnum"><b>{money(sum(pag.filter(t => t.cobrador === c)))}</b></td>
        </motion.tr>)}</tbody>
      </table></div></div>
    </Card>
  </>;
}
