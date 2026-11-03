/* data.js: todos los datos que usa el panel mientras no exista el servidor.
   Al conectar la base de datos, este archivo se reemplazará por consultas al servidor.
   Las pantallas solo importan de aquí, así que el cambio quedará en un solo lugar. */
/* Datos de ejemplo del boceto: se generan siempre igual a partir de una semilla fija */
// Generador de números «aleatorios» con semilla fija: los datos salen iguales cada vez que se abre el panel
let seed = 20261014;
export const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
export const pick = a => a[Math.floor(rnd() * a.length)];

// Utilidades de formato: soles, dos dígitos, hora HH:MM, suma de montos e iniciales de un nombre
export const money = n => 'S/ ' + n.toFixed(2);
export const pad = n => String(n).padStart(2, '0');
export const hhmm = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
export const sum = l => l.reduce((s, t) => s + t.monto, 0);
export const ini = n => n.split(' ').slice(0, 2).map(w => w[0]).join('');

// Las 12 zonas de estacionamiento: [nombre, cantidad de espacios]. Se les agrega un id (0 a 11)
export const ZONAS = [['AV. FERNANDO WIESSE 32 IMPAR',10],['AV. FERNANDO WIESSE 32 PAR',10],['AV. FERNANDO WIESSE 33 IMPAR',22],['AV. FERNANDO WIESSE 33 PAR',22],['CL. VARA DE ORO 2 IMPAR',16],['CL. VARA DE ORO 2 PAR',16],['JR. ALAMEDA LANZON 2 IMPAR',16],['JR. ALAMEDA LANZON 2 PAR',16],['JR. LAS MAQUINARIAS TRAMO 01',28],['JR. LAS MAQUINARIAS TRAMO 02',28],['JR. WIRACOCHA 2 IMPAR',7],['JR. WIRACOCHA 2 PAR',19]].map(([n, cap], i) => ({ n, cap, id:i }));
// Total de espacios de todas las zonas
export const CAP = ZONAS.reduce((s, z) => s + z.cap, 0);

// Personal de campo (cobradores): zonas que tiene asignadas (ids de ZONAS) y colores de su avatar
export const COBR = [
  { nombre:'Luis Quispe Ramos', dni:'45673891', zonas:[0,1], activo:true, col:'#E3EFFA', tx:'#0F4C80' },
  { nombre:'María Huamán Torres', dni:'47120938', zonas:[2,3], activo:true, col:'#FFF4D2', tx:'#6B4C00' },
  { nombre:'Jorge Paredes Vílchez', dni:'43398172', zonas:[4,5], activo:true, col:'#ECF6DD', tx:'#3F7A10' },
  { nombre:'Rosa Salazar Ccori', dni:'46281057', zonas:[6,7], activo:true, col:'#FDE7F1', tx:'#9E0D55' },
  { nombre:'Carlos Mamani Flores', dni:'44850263', zonas:[8,9], activo:true, col:'#E1F3F5', tx:'#0A5862' },
  { nombre:'Ana Gutiérrez Poma', dni:'48019374', zonas:[10,11], activo:true, col:'#FCE9EB', tx:'#A0101F' },
  { nombre:'Pedro Chávez León', dni:'41762590', zonas:[], activo:false, col:'#E8ECF2', tx:'#576079' }
];

/* Datos del celular de cada cobrador (app de campo) */
const CEL = [['Samsung Galaxy A14','1.4.2','hace 1 min'],['Motorola Moto G24','1.4.2','hace 3 min'],['Xiaomi Redmi 13C','1.4.2','hace 2 min'],['Samsung Galaxy A05','1.4.1','hace 6 min'],['Honor X6b','1.4.2','hace 1 min'],['Samsung Galaxy A14','1.4.2','hace 4 min'],['Motorola Moto E13','1.3.9','hace 12 días']];
// A cada cobrador se le agrega tipo, modelo de celular, versión de la app y última sincronización
COBR.forEach((c, i) => { c.tipo = 'campo'; [c.cel, c.ver, c.sync] = CEL[i]; });

/* Roles del panel web */
export const ROLES = {
  admin:{ nombre:'Administrador del sistema', corto:'Administrador', login:'Administrador del sistema - Soporte', desc:'Equipo que creó y mantiene la página y la app', icon:'shield' },
  staff:{ nombre:'Personal administrativo', corto:'Administrativo', desc:'Trabajadores de la Subgerencia de Transporte', icon:'users' }
};
/* Personal que usa solo el panel web */
// Usuarios del panel web. rol 'admin' = administrador del sistema; 'staff' = personal administrativo
export const ADMINS = [
  { nombre:'Marco Silva Rojas', dni:'70012345', rol:'admin', cargo:'Equipo SICOE · Desarrollo', ultimo:'Ahora', activo:true, col:'#1A6FB5', tx:'#FFFFFF' },
  { nombre:'Lucía Fernández Paz', dni:'70456123', rol:'admin', cargo:'Equipo SICOE · Soporte', ultimo:'Hoy 08:12', activo:true, col:'#2AA7B8', tx:'#FFFFFF' },
  { nombre:'Rosa Mendoza Quispe', dni:'40125836', rol:'staff', cargo:'Subgerencia de Transporte', ultimo:'Hoy 07:45', activo:true, col:'#F7B500', tx:'#3A2A00' },
  { nombre:'Julio Torres Vega', dni:'41893027', rol:'staff', cargo:'Caja y rendición', ultimo:'Hoy 09:30', activo:true, col:'#E5127D', tx:'#FFFFFF' },
  { nombre:'Karen Ríos Salas', dni:'45507812', rol:'staff', cargo:'Fiscalización', ultimo:'Hace 20 días', activo:false, col:'#8A92A6', tx:'#FFFFFF' }
];
ADMINS.forEach(a => a.tipo = 'web');
// Usuario que aparece como «sesión iniciada» según el perfil elegido en el inicio de sesión
export const SESION_DEMO = { admin:ADMINS[0], staff:ADMINS[2] };

/* Registro de actividad del sistema (solo lo ve el administrador) */
// Cada registro: [origen web|app, ícono, texto, detalle, hora]
export const ACTIVIDAD = [
  ['web', 'login', 'Marco Silva Rojas inició sesión en el panel', 'Administrador del sistema', '17:18'],
  ['app', 'sync', 'Carlos Mamani Flores sincronizó 14 movimientos', 'App 1.4.2 · Honor X6b', '17:15'],
  ['app', 'alert', 'Pedro Chávez León usa una versión antigua de la app (1.3.9)', 'Se recomienda actualizar', '16:50'],
  ['web', 'edit', 'Lucía Fernández Paz asignó JR. WIRACOCHA 2 PAR a Ana Gutiérrez Poma', 'Usuarios · Personal de campo', '15:02'],
  ['web', 'download', 'Julio Torres Vega exportó la recaudación diaria', 'Reportes · Excel', '13:40'],
  ['app', 'sync', 'María Huamán Torres sincronizó 22 movimientos', 'App 1.4.2 · Motorola Moto G24', '12:31'],
  ['web', 'coins', 'Marco Silva Rojas actualizó el QR de cobro', 'Zonas y tarifa', '10:05'],
  ['web', 'login', 'Julio Torres Vega inició sesión en el panel', 'Personal administrativo', '09:30'],
  ['app', 'login', 'Luis Quispe Ramos inició turno en la app', 'App 1.4.2 · Samsung Galaxy A14', '07:02'],
  ['web', 'login', 'Rosa Mendoza Quispe inició sesión en el panel', 'Personal administrativo', '07:45']
];

// Placas y vehículos de ejemplo
const LET = 'ABCDEFGHJKLMPRSTUVWXYZ';
export const placa = () => pick(LET) + pick(LET.split('').concat('1','2','3','4','5','6','7','8','9')) + pick(LET) + '-' + (100 + Math.floor(rnd() * 899));
export const MOD = [['Toyota Yaris','Rojo'],['Kia Rio','Blanco'],['Hyundai Accent','Gris'],['Nissan Sentra','Azul'],['Suzuki Swift','Negro'],['Chevrolet Sail','Plata'],['Toyota Corolla','Blanco'],['Kia Picanto','Rojo'],['Mitsubishi L200','Gris'],['Hyundai Tucson','Negro']];

// «Ahora» se fija a las 17:20 de hoy para que el boceto siempre muestre un día con movimiento
const HOY = new Date(); HOY.setSeconds(0, 0);
export const AHORA = new Date(HOY); AHORA.setHours(17, 20); // hora fija para que el boceto muestre un día con movimiento
export const esHoy = d => d && d.toDateString() === AHORA.toDateString();

/* T: todos los movimientos (tickets) de los últimos 7 días.
   Cada uno: placa, zona, espacio, inicio, fin, monto, estado ('activo' en parqueo, 'pagado' o 'pendiente' = se fue sin pagar),
   método (QR o Efectivo), N° de operación, cobrador, modelo y color */
export const T = [];
for (let d = 0; d < 7; d++){
  const dia = new Date(AHORA); dia.setDate(dia.getDate() - d);
  const n = d === 0 ? 0 : 110 + Math.floor(rnd() * 50);
  // Crea un movimiento: monto = fracciones de 30 min × S/ 0.80; 6% se van sin pagar y 72% de los pagos son con QR
  const gen = (inicio, est) => {
    const z = Math.floor(rnd() * 12), c = COBR[Math.floor(z / 2)], [modelo, color] = pick(MOD);
    const mins = 8 + Math.floor(rnd() * 160), fr = Math.max(1, Math.ceil(mins / 30));
    let fin = est === 'activo' ? null : new Date(inicio.getTime() + mins * 60000);
    if (fin && fin > AHORA) fin = new Date(Math.max(inicio.getTime() + 5 * 60000, AHORA.getTime() - Math.floor(rnd() * 9 + 1) * 60000));
    const r = rnd(), estado = est || (r < .06 ? 'pendiente' : 'pagado');
    T.push({ placa:placa(), zona:z, espacio:1 + Math.floor(rnd() * ZONAS[z].cap), inicio, fin, monto:fr * .8, estado, metodo: estado === 'pagado' ? (rnd() < .72 ? 'QR' : 'Efectivo') : null, op: estado === 'pagado' && rnd() < .6 ? String(10000000 + Math.floor(rnd() * 89999999)) : '', cobrador:c, modelo, color });
  };
  // Días anteriores: 110 a 160 movimientos repartidos de 7:00 a 20:00. Hoy: más movimiento al mediodía, hasta las 17:20
  if (d > 0) for (let i = 0; i < n; i++){ const h = new Date(dia); h.setHours(7 + Math.floor(rnd() * 13), Math.floor(rnd() * 60)); gen(h); }
  else {
    for (let h = 7; h <= AHORA.getHours(); h++){
      const peso = [3,6,9,11,10,12,14,13,11,10,12,13,9,6][h - 7] || 5;
      for (let i = 0; i < peso; i++){ const t = new Date(AHORA); t.setHours(h, Math.floor(rnd() * 60)); if (t <= AHORA - 15 * 60000) gen(t); }
    }
  }
}
/* Vehículos en parqueo ahora, sin repetir espacio */
const usados = new Set();
for (let i = 0; i < 74; i++){
  const z = Math.floor(rnd() * 12), e = 1 + Math.floor(rnd() * ZONAS[z].cap), k = z + '-' + e;
  if (usados.has(k)) continue; usados.add(k);
  const t = new Date(AHORA.getTime() - (5 + Math.floor(rnd() * 170)) * 60000), [modelo, color] = pick(MOD);
  T.push({ placa:placa(), zona:z, espacio:e, inicio:t, fin:null, monto:Math.max(1, Math.ceil((AHORA - t) / 1800000)) * .8, estado:'activo', metodo:null, op:'', cobrador:COBR[Math.floor(z / 2)], modelo, color });
}
// Del más reciente al más antiguo, con un id único para cada uno
T.sort((a, b) => b.inicio - a.inicio);
T.forEach((t, i) => t.id = 'm' + i);

/* Movimiento nuevo para la simulación «en vivo» (minutos después de AHORA) */
let nId = 0;
export const nuevoMovimiento = minDespues => {
  const z = Math.floor(rnd() * 12), [modelo, color] = pick(MOD), cuando = new Date(AHORA.getTime() + minDespues * 60000);
  const r = rnd(), estado = r < .5 ? 'activo' : r < .93 ? 'pagado' : 'pendiente';
  return { id:'n' + nId++, placa:placa(), zona:z, espacio:1 + Math.floor(rnd() * ZONAS[z].cap), inicio:cuando, fin:estado === 'activo' ? null : cuando,
    monto:(1 + Math.floor(rnd() * 4)) * .8, estado, metodo:estado === 'pagado' ? (rnd() < .72 ? 'QR' : 'Efectivo') : null, cobrador:COBR[Math.floor(z / 2)], modelo, color };
};

/* ---------- Datos de control: constancias, deudas recuperadas, ubicación y cierres de turno ----------
   Usan su propio generador para no alterar los datos de ejemplo anteriores */
let seed2 = 7731;
const r2 = () => (seed2 = (seed2 * 16807) % 2147483647) / 2147483647;
const p2 = a => a[Math.floor(r2() * a.length)];

/* Plano esquemático de las zonas, en metros. Cada zona es un tramo de calle; IMPAR y PAR van a cada lado */
// Calles del plano (en metros, solo para dibujar): punto inicial a, punto final b; av = avenida (más ancha)
export const CALLES = [
  { n:'Av. Fernando Wiesse', a:[40, 300], b:[960, 300], av:true },
  { n:'Cl. Vara de Oro', a:[250, 40], b:[250, 300] },
  { n:'Jr. Alameda Lanzón', a:[560, 300], b:[560, 560] },
  { n:'Jr. Las Maquinarias', a:[400, 110], b:[960, 110] },
  { n:'Jr. Wiracocha', a:[860, 300], b:[860, 540] }
];
// Tramo de calle de cada zona [inicio, fin, desplazamiento]. IMPAR y PAR se separan hacia cada lado de la calle
const TRAMO = [[[80,300],[380,300],-14],[[80,300],[380,300],14],[[400,300],[720,300],-14],[[400,300],[720,300],14],
  [[250,60],[250,280],-12],[[250,60],[250,280],12],[[560,320],[560,540],-12],[[560,320],[560,540],12],
  [[420,110],[680,110],0],[[700,110],[950,110],0],[[860,320],[860,520],-12],[[860,320],[860,520],12]];
ZONAS.forEach((z, i) => { const [a, b, off] = TRAMO[i], h = a[1] === b[1];
  z.seg = [[a[0] + (h ? 0 : off), a[1] + (h ? off : 0)], [b[0] + (h ? 0 : off), b[1] + (h ? off : 0)]]; });
/* Distancia (m) de un punto al tramo de su zona */
// Calcula la distancia más corta entre el punto y el segmento de la zona
export const distZona = (p, z) => {
  const [[x1, y1], [x2, y2]] = ZONAS[z].seg, dx = x2 - x1, dy = y2 - y1;
  const k = Math.max(0, Math.min(1, ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (x1 + k * dx), p.y - (y1 + k * dy));
};
export const FUERA = 120; // metros: más lejos que esto, el registro se marca «fuera de zona»
// Convierte metros del plano a latitud y longitud de ejemplo (1° de latitud ≈ 110 574 m)
const LAT0 = -11.9765, LNG0 = -77.0072; // punto de referencia de ejemplo en San Juan de Lurigancho
export const latlng = p => ({ lat:+(LAT0 - p.y / 110574).toFixed(6), lng:+(LNG0 + p.x / 108880).toFixed(6) });
/* Punto GPS de ejemplo sobre el tramo de una zona (con unos metros de error); si «lejos», se aleja 160 a 420 m.
   Guarda la distancia a su zona y si quedó fuera */
const punto = (z, lejos) => {
  const [[x1, y1], [x2, y2]] = ZONAS[z].seg, k = r2();
  let x = x1 + (x2 - x1) * k + (r2() - .5) * 18, y = y1 + (y2 - y1) * k + (r2() - .5) * 18;
  if (lejos){ const a = r2() * Math.PI * 2, d = 160 + r2() * 260; x += Math.cos(a) * d; y += Math.sin(a) * d; }
  const p = { x:Math.round(Math.max(18, Math.min(982, x))), y:Math.round(Math.max(18, Math.min(582, y))), prec:5 + Math.round(r2() * 20) };
  p.dist = Math.round(distZona(p, z)); p.fuera = p.dist > FUERA; return p;
};

/* Constancias verificadas en la app y ubicación de cada registro */
// Motivos de alerta de la constancia, como los que detecta la app
const MOTIVOS = ['Constancia ya usada en otra placa', 'Monto distinto al total', 'Constancia de otro día'];
T.forEach(t => {
  /* Pagos con QR: 78% verificados, 10% «revisar», 5% con alerta y el resto sin verificar.
     Cada registro tiene ubicación del ingreso (gps) y, si ya salió, del cobro (gpsCobro); 3% quedan fuera de zona */
  if (t.estado === 'pagado' && t.metodo === 'QR'){
    const r = r2(); t.verif = r < .78 ? { estado:'ok' } : r < .88 ? { estado:'revisar' } : r < .93 ? { estado:'alerta', motivo:p2(MOTIVOS) } : null;
  }
  const lejos = r2() < .03;
  t.gps = punto(t.zona, lejos);
  if (t.estado !== 'activo') t.gpsCobro = punto(t.zona, lejos && r2() < .7);
});

/* Deudas recuperadas: placas que se fueron sin pagar y pagaron al volver esta semana */
export const RECUPERADAS = [];
// 9 deudas de días anteriores que se pagaron al volver; «junto» = se cobraron con el nuevo estacionamiento
for (let i = 0; i < 9; i++){
  const z = Math.floor(r2() * 12), c = COBR[Math.floor(z / 2)], dias = 2 + Math.floor(r2() * 5), [modelo, color] = p2(MOD);
  const inicio = new Date(AHORA); inicio.setDate(inicio.getDate() - dias); inicio.setHours(8 + Math.floor(r2() * 10), Math.floor(r2() * 60));
  const pagadoEn = new Date(AHORA); pagadoEn.setDate(pagadoEn.getDate() - Math.floor(r2() * Math.min(dias, 3))); pagadoEn.setHours(8 + Math.floor(r2() * 9), Math.floor(r2() * 60));
  if (pagadoEn > AHORA) pagadoEn.setTime(AHORA.getTime() - 40 * 60000);
  const fr = 1 + Math.floor(r2() * 4);
  RECUPERADAS.push({ id:'r' + i, placa:placa(), zona:z, espacio:1 + Math.floor(r2() * ZONAS[z].cap), inicio, fin:new Date(inicio.getTime() + fr * 25 * 60000),
    monto:fr * .8, estado:'pagado', metodo:r2() < .6 ? 'QR' : 'Efectivo', pagadoEn, recuperada:true, junto:r2() < .55, cobrador:c, modelo, color });
}
RECUPERADAS.sort((a, b) => b.pagadoEn - a.pagadoEn);

/* Cierres de turno con cuadre de caja: los 6 días anteriores cerrados y hoy en curso */
const NOTAS_F = ['Di vuelto de más a un conductor', 'Un billete de S/ 10 falso, se retuvo', 'Error al dar vuelto en la tarde', 'Pago en efectivo registrado como QR por error'];
const NOTAS_S = ['Conductor no esperó su vuelto', 'Propina de un conductor, se entrega igual', 'Se cobró una deuda antigua en efectivo sin registrarla'];
// Por cada día y cobrador activo: cobros del turno, monto por QR y efectivo a entregar (suma de pagos en efectivo)
export const TURNOS = [];
for (let d = 0; d < 7; d++){
  const dia = new Date(AHORA); dia.setDate(dia.getDate() - d);
  COBR.filter(c => c.activo).forEach((c, ci) => {
    const desde = new Date(dia); desde.setHours(7, Math.floor(r2() * 6));
    const del = T.filter(t => t.cobrador === c && t.inicio.toDateString() === dia.toDateString());
    const pag = del.filter(t => t.estado === 'pagado'), ef = pag.filter(t => t.metodo === 'Efectivo');
    const esperado = Math.round(sum(ef) * 100) / 100, qr = Math.round(sum(pag.filter(t => t.metodo === 'QR')) * 100) / 100;
    // Hoy el turno sigue en curso: todavía no hay efectivo contado
    if (d === 0){ TURNOS.push({ id:`t${d}-${ci}`, cobrador:c, desde, hasta:null, cobros:pag.length, qr, efectivo:esperado, contado:null, diferencia:null, deudas:del.filter(t => t.estado === 'pendiente').length, nota:'' }); return; }
    // Días anteriores: 72% cuadran; el resto tiene un faltante o sobrante con su motivo
    const hasta = new Date(dia); hasta.setHours(19, 15 + Math.floor(r2() * 40));
    const r = r2(), dif = r < .72 ? 0 : r < .83 ? -p2([0.8, 0.1, 1.6, 0.5]) : r < .95 ? p2([0.2, 0.5, 0.8]) : -p2([2.4, 3.2]);
    TURNOS.push({ id:`t${d}-${ci}`, cobrador:c, desde, hasta, cobros:pag.length, qr, efectivo:esperado, contado:Math.round((esperado + dif) * 100) / 100,
      diferencia:dif, deudas:del.filter(t => t.estado === 'pendiente').length, nota:dif < 0 ? p2(NOTAS_F) : dif > 0 ? p2(NOTAS_S) : '' });
  });
}
