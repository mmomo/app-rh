# Evidencia — Iteración 6 (A8, R8, R5) en producción

> Fecha: 2026-11-21 · URL: https://app-rh-iota.vercel.app · Build `assets/index-Drcgoo5s.js` + estilos `index-Cxf0t53B.css`
> CI de GitHub Actions (lint, pruebas, build): ✅ · 124 pruebas locales ✅

Verificación automatizada con Chrome headless sobre la URL pública, en escritorio (1280 px) y móvil (390 px), partiendo de un navegador sin datos.

| Caso | Resultado | Captura |
|---|---|---|
| La lista muestra Activos por omisión, el filtro con conteos y "Dar de baja" en lugar de "Eliminar" | ✅ "Activos (2) · Ex empleados (0) · Todos (2)"; no aparece "Eliminar" | `01-lista-activos` |
| Baja sin datos y con fecha anterior al ingreso (R8) | ✅ Bloqueado; se marcan fecha y motivo: "La baja no puede ser anterior al ingreso (02/03/2026)." | `02-baja-errores` |
| Baja de Carlos el 20/11/2026 por renuncia, con comentario | ✅ Se guarda | `03-baja-capturada` |
| Detalle del ex empleado | ✅ "Dado de baja el 20/11/2026 · Motivo: Renuncia · Cambio de ciudad"; sin formularios, sin vacaciones, sin Editar ni Dar de baja; antigüedad al darse de baja y último salario | `04-detalle-ex-empleado` |
| Filtro Ex empleados y Todos | ✅ "Activos (1) · Ex empleados (1)"; fila con etiqueta "Ex empleado", vacaciones "—" y solo "Ver" | `05-lista-ex-empleados`, `06-lista-todos` |
| Alta con el NSS del ex empleado (R5 entre activos) | ✅ Se permite y se informa: "Este NSS perteneció a Carlos Alberto Méndez Torres (ex empleado, baja el 20/11/2026); se permite para recontratación." | `07-alta-nss-ex-empleado` |
| Editar un ex empleado desde la URL | ✅ Aviso de solo consulta, sin formulario | — |
| Lighthouse Accesibilidad (lista, alta, detalle, detalle con avisos, formulario de baja y detalle de ex empleado; móvil y escritorio) | ✅ 100 en las 12 auditorías | — |

Las capturas están en `capturas/iteracion-6/` con sufijo `-escritorio` y `-movil`.

**Corrección detectada en las capturas:** en escritorio el botón "Dar de baja" de la lista partía su texto en dos líneas. Se agregó `white-space: nowrap` a los botones, se volvió a desplegar y se retomaron las capturas.
