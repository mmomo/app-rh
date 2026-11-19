# Evidencia A5 — Interfaz clara (accesibilidad)

**Criterio (requerimientos v1.1):** todos los campos con etiqueta visible y asociada; Lighthouse Accesibilidad ≥ 90 en lista, formulario y detalle.

## Auditoría Lighthouse
- Fecha: 2026-11-19
- Lighthouse 12, Chrome Headless Shell 158, build de producción (`vite build` + `vite preview`).
- Datos de ejemplo cargados en `localStorage`: 1 empleado, 1 aumento, 2 permisos (uno de cada tipo).

| Pantalla | Móvil | Escritorio |
|---|---|---|
| Lista `/empleados` | 100 | 100 |
| Formulario `/empleados/nuevo` | 100 | 100 |
| Detalle `/empleados/:id` | 100 | 100 |

**Resultado: cumple (≥ 90).**

## Pruebas automatizadas
`src/test/accesibilidad.test.tsx` corre axe-core (el motor que usa Lighthouse) en las tres pantallas, incluyendo los estados con errores de validación, y comprueba que cada `<input>` tenga etiqueta asociada. jsdom no calcula estilos, así que el contraste de color se valida solo con Lighthouse.

## Ajuste derivado de la revisión
En móvil (375 px), el texto oculto para lectores de pantalla (`.sr-only`) dentro de las tablas provocaba desplazamiento horizontal de toda la página. Se corrigió con `position: relative` en `.tabla-contenedor`.
