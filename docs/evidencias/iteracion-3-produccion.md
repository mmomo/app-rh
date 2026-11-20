# Evidencia — Iteración 3 (A6 vacaciones, R6 saldo) en producción

- **URL:** https://app-rh-iota.vercel.app
- **Fecha:** 2026-11-20
- **Despliegue:** automático desde GitHub (`main`, commit `e854cf8`). CI en GitHub Actions: ✅ lint, 88 pruebas y build.

## Criterios verificados en producción
Recorrido automatizado en Chrome headless contra la URL pública, operando la interfaz (fecha del sistema: 20/11/2026):

| Req. | Verificación | Resultado |
|---|---|---|
| A6 | Ingreso 15/03/2020 → corresponden 22; vacaciones del lunes 30/11 al domingo 06/12/2026 → usados 5, restantes 17; el historial muestra "5 laborables" | ✅ |
| R6 | Con 17 restantes, vacaciones del 04/01 al 31/01/2027 (20 laborables) → bloqueado y el saldo no cambia | ✅ |
| Regresión | R1, R3, R4, R5, A1, A2, A3, A4, R2a, R2b, R2c y persistencia al recargar | ✅ |

## Lighthouse Accesibilidad (A5)
100 en móvil y escritorio en lista, formulario, detalle (con sección de vacaciones) y detalle con datos incompletos.

## Ajuste derivado de la revisión visual
En móvil (375 px), la etiqueta "Corresponden" no cabía en su recuadro. En pantallas de 480 px o menos, las tres cifras se muestran en filas (etiqueta a la izquierda, número a la derecha).
