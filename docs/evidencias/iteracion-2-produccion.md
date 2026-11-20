# Evidencia — Iteración 2 (R3, R4, R5) en producción

- **URL:** https://app-rh-iota.vercel.app
- **Fecha:** 2026-11-20
- **Despliegue:** automático desde GitHub (`main`, commit `266e7c1`) mediante la integración Vercel ↔ GitHub. CI en GitHub Actions: ✅ lint, 68 pruebas y build.

## Criterios verificados en producción
Recorrido automatizado en Chrome headless contra la URL pública, operando la interfaz:

| Req. | Verificación | Resultado |
|---|---|---|
| R3 | Salario mensual inicial $9,000 → bloqueado (mínimo general 2026: $9,582.47) | ✅ |
| R4 | Nacimiento 20/05/2005, ingreso 19/05/2023 → bloqueado; ingreso 20/05/2023 → aceptado | ✅ |
| R5 | Alta con un NSS ya asignado → bloqueado, indicando a quién pertenece | ✅ |
| Regresión | R1, A1, A2, A3, A4, R2a, R2b, R2c y persistencia al recargar | ✅ |

## Lighthouse Accesibilidad (A5)

| Pantalla | Móvil | Escritorio |
|---|---|---|
| Lista (con etiqueta "Datos incompletos") | 100 | 100 |
| Formulario (con NSS y fecha de nacimiento) | 100 | 100 |
| Detalle | 100 | 100 |
| Detalle de empleado con datos incompletos (aviso) | 100 | 100 |

## Ajuste derivado de la revisión visual
El mensaje de error de R4 repetía el texto de ayuda del campo. Se cambió para indicar la edad al ingreso ("A su fecha de ingreso (19/05/2023) tenía 17 años; es menor de edad.") y se separó el caso de nacimiento posterior al ingreso.
