# SICOE · Panel web administrativo

Panel web del **Sistema de Cobro de Estacionamiento** de la Municipalidad de San Juan de Lurigancho
(Subgerencia de Transporte), para el personal administrativo y de soporte.
Está hecho con **React 19 + Motion + Vite**.

> SICOE tiene dos repositorios: este **panel web** y la **app de campo** de los cobradores
> ([APP-SICOE](https://github.com/Angela08T/APP-SICOE)).
> Documentación completa (instalación, manual de usuario y cómo funciona): [`docs/DOCUMENTACION.md`](docs/DOCUMENTACION.md).

Por ahora usa **datos de ejemplo**; todavía no hay un servidor que lo conecte con la app.

## Qué muestra

| Grupo | Secciones |
|---|---|
| Operación | Resumen del día · Ocupación en vivo · Movimientos · Deudas |
| Control | Cierres de turno (cuadre de caja) · Ubicaciones |
| Administración | Usuarios · Cobradores · Zonas y tarifa · Reportes |
| Sistema | Actividad |

## Perfiles de acceso

Se eligen al iniciar sesión:

- **Administrador del sistema - Soporte:** ve y edita todo, incluidos Reportes y la Actividad del sistema.
- **Personal administrativo:** todo menos Reportes y Actividad. Puede crear usuarios, pero no asignar el perfil de
  administrador ni editar cuentas de administrador.

Los permisos se aplican solo en la pantalla (`NAV` en `src/App.jsx`); cuando exista el servidor, también deberá
validarlos.

## Cómo usarlo

- **Ver sin instalar nada:** abrir `index.html` con doble clic (funciona sin internet).
- **Editar con recarga inmediata** (necesita Node.js 20 o superior):

  ```powershell
  npm.cmd install      # solo la primera vez
  npm.cmd run dev
  ```

- **Generar el archivo final:** `npm.cmd run build`. Regenera `index.html`, un solo archivo con todo incluido.

## Estructura

| Carpeta / archivo | Qué contiene |
|---|---|
| `index.html` | Panel ya generado, listo para abrir |
| `src/App.jsx` | Estructura general, menú y permisos por perfil |
| `src/views/` | Una pantalla por sección |
| `src/components/` | Inicio de sesión y piezas reutilizables |
| `src/data.js` | Datos de ejemplo, zonas y roles |
| `src/styles.css` | Colores y estilos (tema claro y oscuro) |
| `src/recursos/` | Logo y tipografías |
| `construir.js` · `vite.config.mjs` | Generación de `index.html` con Vite |
| `version-html/` | Versión anterior del panel en HTML (referencia) |

## Próximos pasos

- Servidor y base de datos para recibir los registros de la app de campo.
- Usuarios reales y validación de permisos en el servidor.
- Enviar la tarifa y las zonas configuradas a todas las apps.
