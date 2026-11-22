# Evidencia — Iteración 7 (A9) en producción

> Fecha: 2026-11-22 · URL: https://app-rh-iota.vercel.app · Build `assets/index-ZWcJWjeD.js`
> CI de GitHub Actions (lint, pruebas, build): ✅ · 144 pruebas locales ✅ (el criterio de aceptación de A9 se prueba en `domain/panel.test.ts` y `pages/Panel.test.tsx`)

Verificación automatizada con Chrome headless sobre la URL pública, en escritorio (1280 px) y móvil (390 px).

| Caso | Resultado | Captura |
|---|---|---|
| Navegador sin datos: `/` abre el panel | ✅ Redirige a `/panel`; con solo los ejemplos (A7): 2 activos, nómina $54,500.00, nadie ausente, sin permisos en el mes | `01-panel-solo-ejemplos` |
| Con datos de demostración (altas y bajas en el año, aumento, ausencias hoy) | ✅ 7 activos (sin cambio vs. octubre), nómina $131,500.00 (+$5,000.00, +4 % vs. octubre), 2 ausentes hoy; gráfica de 12 meses, nómina por departamento y permisos del mes | `02-panel` |
| La página no se desplaza horizontalmente en celular | ✅ Ancho 390 px; la tabla por departamento cabe sin desplazamiento | `02-panel-movil` |
| Lighthouse Accesibilidad (panel y todas las pantallas anteriores; móvil y escritorio) | ✅ 100 en las 14 auditorías | — |

Las capturas están en `capturas/iteracion-7/` con sufijo `-escritorio` y `-movil`. Los datos de demostración se cargaron solo en el navegador de prueba (localStorage); no forman parte de la app.
