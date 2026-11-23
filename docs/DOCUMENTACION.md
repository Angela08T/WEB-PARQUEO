# SICOE · Panel web administrativo

**Sistema de Cobro de Estacionamiento**
Municipalidad de San Juan de Lurigancho · Subgerencia de Transporte

> SICOE tiene dos partes, cada una en su propio repositorio:
> **app de campo** (https://github.com/Angela08T/APP-SICOE) y **panel web** (https://github.com/Angela08T/WEB-SICOE).
> Este repositorio es el **panel web** para la oficina.

---

## Contenido

1. [¿Qué es?](#1-qué-es)
2. [Cómo funciona](#2-cómo-funciona)
3. [Guía de instalación](#3-guía-de-instalación)
4. [Manual de usuario](#4-manual-de-usuario)
5. [Reglas del cobro](#5-reglas-del-cobro)
6. [Cómo está hecho](#6-cómo-está-hecho)
7. [Problemas comunes y soluciones](#7-problemas-comunes-y-soluciones)
8. [Estado actual y próximos pasos](#8-estado-actual-y-próximos-pasos)

---

## 1. ¿Qué es?

Página web para el **personal administrativo y de soporte** de la municipalidad. Muestra la recaudación del día, la
ocupación de cada zona, los movimientos, las deudas, los cierres de turno y las ubicaciones de los cobradores, y
permite gestionar usuarios, cobradores, zonas y la tarifa.

Por ahora usa **datos de ejemplo**. Cuando exista el servidor, recibirá los registros de la **app de campo**
(https://github.com/Angela08T/APP-SICOE) que usan los cobradores.

---

## 2. Cómo funciona

```
   CALLE                                        OFICINA
┌──────────────────────┐                ┌───────────────────────────┐
│  App de campo        │                │  Panel web                │
│  (celular Android)   │   (futuro:     │  (navegador)              │
│                      │    servidor)   │                           │
│  • Registrar placa   │  ───────────▶  │  • Resumen del día        │
│  • Tiempo y monto    │                │  • Ocupación en vivo      │
│  • Cobrar QR/efect.  │                │  • Movimientos y deudas   │
│  • Deudas            │                │  • Cierres de turno       │
│  • Cierre de turno   │  ◀───────────  │  • Zonas y tarifa         │
│                      │   (tarifa,     │  • Usuarios y cobradores  │
│  Datos en el celular │    zonas)      │  Datos de ejemplo         │
└──────────────────────┘                └───────────────────────────┘
```

### El recorrido de un vehículo

1. **Llega un vehículo.** El cobrador escribe la placa, elige la zona y toca un espacio libre → **Iniciar**.
   La app guarda la hora de entrada y, si está activado, la ubicación GPS.
2. **Mientras está estacionado.** En **Activos** se ve el tiempo y el monto en vivo. Unos minutos antes de que suba
   de fracción, el celular vibra y avisa (aunque la app esté cerrada).
3. **Se retira.** El cobrador toca **Detener y cobrar**. La app muestra el total (con las deudas anteriores de esa
   placa ya sumadas) y el QR de la municipalidad.
4. **Paga.**
   - **Con QR:** el conductor escanea y paga. El cobrador puede tomar foto de la constancia de Yape/Plin y la app
     revisa el monto, el N° de operación y la fecha.
   - **En efectivo:** se registra el cobro.
   - **Se fue sin pagar:** queda como **deuda**. La próxima vez que esa placa se registre, la app lo avisa y el
     monto se suma al cobro.
5. **Fin del turno.** El cobrador hace el **cierre de turno**: cuenta el efectivo por billetes y monedas, y la app lo
   compara con lo que debería tener.
6. **Oficina.** Toda esa información es la que el panel muestra (cuando exista el servidor, llegará sola).

---

## 3. Guía de instalación

### 3.1 Requisitos

| Para… | Necesitas |
|---|---|
| Solo **ver el panel** | Un navegador (Chrome, Edge, Firefox). Nada más. |
| **Editar el panel** | [Node.js](https://nodejs.org) 20 o superior |

### 3.2 Descargar el proyecto

```powershell
git clone https://github.com/Angela08T/WEB-SICOE.git
cd WEB-SICOE
```

### 3.3 Solo verlo (sin instalar nada)

Abrir `index.html` con doble clic. Funciona sin internet: es un solo archivo con todo incluido.

### 3.4 Editarlo con recarga inmediata

```powershell
npm.cmd install        # solo la primera vez
npm.cmd run dev
```

Abrir en el navegador la dirección que aparece (normalmente `http://localhost:5173`). Cada cambio que guardes en
`src/` se ve al instante.

### 3.5 Generar el archivo final

```powershell
npm.cmd run build      # actualiza index.html
```

> En PowerShell usa `npm.cmd` en lugar de `npm` si te aparece un error de "ejecución de scripts deshabilitada".

---

## 4. Manual de usuario

### 4.1 Iniciar sesión

Elegir el perfil, escribir el **DNI** (8 dígitos) y la **contraseña**, y tocar **Ingresar**.
Al elegir un perfil se llena el DNI de un usuario de ejemplo.

| Perfil | Qué puede hacer |
|---|---|
| **Administrador del sistema - Soporte** | Ve y edita todo, incluidos **Reportes** y la **Actividad** del sistema |
| **Personal administrativo** | Todo menos Reportes y Actividad. Puede crear usuarios, pero **no** asignar el perfil de administrador ni editar cuentas de administrador |

### 4.2 Partes de la pantalla

- **Menú lateral** (en celular se abre con el botón ☰): secciones agrupadas en *Operación*, *Control*,
  *Administración* y *Sistema*. Deudas muestra un contador rojo; Ocupación en vivo, un punto verde.
- **Barra superior:** búsqueda rápida de placas, cambio de tema claro/oscuro y campana de notificaciones.
- Cada sección tiene su propia dirección (`#resumen`, `#deudas`…), así que se puede guardar en favoritos.

### 4.3 Secciones

| Grupo | Sección | Qué muestra | Admin | Personal |
|---|---|---|:-:|:-:|
| Operación | **Resumen** | Recaudación del día, QR vs. efectivo, ocupación, deudas y actividad reciente | ✔ | ✔ |
| Operación | **Ocupación en vivo** | Espacios ocupados en las 12 zonas, ahora mismo | ✔ | ✔ |
| Operación | **Movimientos** | Ingresos, pagos y deudas registrados por los cobradores, con filtros, verificación de constancias y "¿quién maneja?" | ✔ | ✔ |
| Operación | **Deudas** | Vehículos que se retiraron sin pagar y deudas recuperadas | ✔ | ✔ |
| Control | **Cierres de turno** | Cuadre de caja de cada cobrador: esperado, contado, diferencia y motivo | ✔ | ✔ |
| Control | **Ubicaciones** | Dónde se registró cada ingreso y cobro de hoy (GPS) | ✔ | ✔ |
| Administración | **Usuarios** | Personal de campo y administrativo: crear, editar, activar o desactivar | ✔ | ✔ (sin perfil admin) |
| Administración | **Cobradores** | Personal de campo con acceso a la app y su estado (activo o desactivado) | ✔ | ✔ |
| Administración | **Zonas y tarifa** | Zonas, capacidad, tarifa, fracción y tolerancia que reciben las apps | ✔ | ✔ |
| Administración | **Reportes** | Descarga de información para control y rendición | ✔ | — |
| Sistema | **Actividad** | Todo lo que pasa en el panel y en las apps | ✔ | — |

---

## 5. Reglas del cobro

### 5.1 Tarifa

- **Monto por fracción:** S/ 0.80
- **Duración de la fracción:** 30 minutos
- **Tolerancia:** 0 minutos (configurable)
- Toda fracción empezada se cobra completa, y siempre se cobra al menos una fracción.

```
fracciones = máximo(1, redondear hacia arriba((minutos − tolerancia) ÷ 30))
monto      = fracciones × S/ 0.80
```

| Tiempo | Fracciones | Monto |
|---|---|---|
| 10 min | 1 | S/ 0.80 |
| 30 min | 1 | S/ 0.80 |
| 1 h | 2 | S/ 1.60 |
| 1 h 10 min | 3 | S/ 2.40 |

### 5.2 Deudas

- Si el vehículo **se fue sin pagar**, el monto queda como deuda de la **placa**.
- Al registrar de nuevo esa placa, la app avisa de la deuda.
- Al cobrar, el total incluye las deudas anteriores; al pagar, todas quedan pagadas y se marcan como **recuperadas**.

### 5.3 Zonas

| Zona | Espacios |
|---|:-:|
| AV. FERNANDO WIESSE 32 IMPAR | 10 |
| AV. FERNANDO WIESSE 32 PAR | 10 |
| AV. FERNANDO WIESSE 33 IMPAR | 22 |
| AV. FERNANDO WIESSE 33 PAR | 22 |
| CL. VARA DE ORO 2 IMPAR | 16 |
| CL. VARA DE ORO 2 PAR | 16 |
| JR. ALAMEDA LANZON 2 IMPAR | 16 |
| JR. ALAMEDA LANZON 2 PAR | 16 |
| JR. LAS MAQUINARIAS TRAMO 01 | 28 |
| JR. LAS MAQUINARIAS TRAMO 02 | 28 |
| JR. WIRACOCHA 2 IMPAR | 7 |
| JR. WIRACOCHA 2 PAR | 19 |

---

## 6. Cómo está hecho

### 6.1 Tecnologías

- **React 19** con **Motion** para las animaciones.
- **Vite 8** con `vite-plugin-singlefile`: todo se junta en un solo `index.html` que funciona sin internet.
- **Datos:** de ejemplo, en `src/data.js`.

### 6.2 Estructura del repositorio

```
WEB-SICOE/
├── index.html             Panel ya generado (abrir con doble clic)
├── package.json           Librerías y comandos (dev, build)
├── construir.js           Genera index.html con Vite
├── vite.config.mjs        Configuración de Vite
├── version-html/          Versión anterior del panel en HTML (referencia)
├── docs/
│   └── DOCUMENTACION.md   Este documento
└── src/
    ├── App.jsx            Estructura, menú y permisos por perfil (NAV)
    ├── data.js            Datos de ejemplo, zonas, roles
    ├── styles.css         Colores y estilos
    ├── recursos/          Logo y tipografías
    ├── components/        Login, Icon, ui (piezas reutilizables)
    └── views/             Una pantalla por sección: Resumen, Vivo, Movimientos, Deudas,
                           Cierres, Mapa, Usuarios, Cobradores, Zonas, Reportes, Actividad
```

### 6.3 Cómo funciona por dentro


- `App.jsx` decide qué sección mostrar según la dirección (`#resumen`, `#vivo`…) y qué menú ve cada perfil (`NAV`).
  Si un perfil intenta abrir una sección que no le corresponde, vuelve al Resumen.
- Cada sección es un componente en `views/`. Los datos vienen de `data.js` (ejemplos realistas del día).
- `construir.js` usa Vite con `vite-plugin-singlefile` para juntar todo (código, estilos, logo y fuentes) en un
  solo `index.html` que se abre sin servidor ni internet.

> **Seguridad:** los permisos por perfil hoy solo se aplican en la pantalla. Cuando exista el servidor, también debe
> validarlos.

---

## 7. Problemas comunes y soluciones

| Problema | Solución |
|---|---|
| PowerShell: *"la ejecución de scripts está deshabilitada"* al usar `npm` | Usar `npm.cmd` en lugar de `npm` |
| `npm run dev` falla con *"vite no se reconoce"* | Ejecutar antes `npm.cmd install` |
| Los cambios no se ven al abrir `index.html` | `index.html` es el archivo generado: ejecutar `npm.cmd run build` después de editar `src/` |

---

## 8. Estado actual y próximos pasos

**Listo:** panel con todas las secciones, dos perfiles de acceso, tema claro/oscuro y animaciones.

**Pendiente:**

1. **Servidor y base de datos** para recibir los registros de la app de campo, con usuarios reales y validación de
   permisos en el servidor (hoy los permisos por perfil solo se aplican en la pantalla).
2. Enviar la **tarifa y las zonas** configuradas en el panel a todas las apps.
3. **Pruebas** con el personal administrativo en un piloto.
