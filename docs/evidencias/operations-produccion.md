# Evidencia — Operations (producción)

- **URL de producción:** https://app-rh-iota.vercel.app
- **Fecha:** 2026-11-19
- **Despliegue:** `vercel --prod` (Vercel CLI 66.4.0), proyecto `app-rh`; build `npm run build`, salida `dist/`.

## Disponibilidad y rutas
Con `vercel.json`, recargar una ruta interna sirve `index.html` (HTTP 200):
`/`, `/empleados`, `/empleados/nuevo`, `/empleados/:id/editar`.

## Criterios de aceptación verificados en producción
Recorrido automatizado en Chrome headless contra la URL pública, operando la interfaz como lo haría un usuario:

| Req. | Verificación | Resultado |
|---|---|---|
| R1 | Guardar sin fecha de ingreso → campo marcado, no se guarda | ✅ |
| A1 | Crear → aparece en la lista → editar puesto → eliminar | ✅ |
| A4 | Ingreso 15/03/2020 → "6 años 8 meses" | ✅ |
| R2b | Vigente $10,000, aumento a $9,500 → bloqueado | ✅ |
| A3 | Aumento a $11,500 → vigente $11,500, historial con ambos | ✅ |
| R2a | Permiso con inicio 10/12 y fin 05/12 → bloqueado | ✅ |
| R2c | Permiso con inicio 01/01/2020 (ingreso 15/03/2020) → bloqueado | ✅ |
| A2 | Un permiso de cada tipo en el historial con su tipo visible | ✅ |
| — | Los datos persisten al recargar una ruta interna | ✅ |

## Lighthouse Accesibilidad (A5) en producción

| Pantalla | Móvil | Escritorio |
|---|---|---|
| Lista | 100 | 100 |
| Formulario | 100 | 100 |
| Detalle | 100 | 100 |

## Notas de operación
- Los datos viven en `localStorage` de cada navegador: no se comparten entre usuarios ni dispositivos.
- Desde 2026-11-20 el proyecto está conectado a GitHub (`mmomo/app-rh`): cada push a `main` despliega a producción automáticamente. `npx vercel --prod` sigue disponible para despliegues manuales.
