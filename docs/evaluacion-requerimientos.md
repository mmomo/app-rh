# Evaluación del cumplimiento de requerimientos

> Fecha: 2026-11-22
> Versión evaluada: `requerimientos.md` v1.7, commit `73e608c` en `main`, desplegado en https://app-rh-iota.vercel.app (bundle `index-ZWcJWjeD.js`)

## 1. Resultado
**Se cumplen los 19 requerimientos (9 atributos y 10 restricciones).**
- Cada criterio de aceptación y cada caso de prueba de `requerimientos.md` tiene al menos una prueba automatizada con el mismo ejemplo.
- Todos se verificaron en producción.
- No se encontraron defectos que impidan cumplir un requerimiento.

Las observaciones de §5 son riesgos y mejoras, no incumplimientos. La más urgente es actualizar el salario mínimo de R3 antes del 01/01/2027.

## 2. Método
| Verificación | Cómo se hizo | Resultado (2026-11-22) |
|---|---|---|
| Pruebas automatizadas | `npm test` (Vitest, Testing Library, axe-core), con fecha simulada para los ejemplos con "hoy" | ✅ 144 de 144 pruebas en 17 archivos |
| Análisis estático | `npm run lint` (ESLint) y `tsc -b` (TypeScript estricto) | ✅ sin errores ni advertencias |
| Build | `npm run build` | ✅ JS 305 kB (95 kB gzip) y CSS 7.5 kB |
| Integración continua | GitHub Actions: lint, pruebas y build en cada push | ✅ las últimas 3 ejecuciones en verde |
| Producción: disponibilidad | HTTP a `/`, `/panel`, `/empleados`, `/empleados/nuevo` y una ruta inexistente | ✅ 200 en todas; el bundle servido es el del último commit |
| Producción: funcionalidad | Recorridos automatizados en Chrome headless contra la URL pública, en cada iteración (ver `docs/evidencias/`). Hoy se repitió el de A7 con almacenamiento vacío. | ✅ |
| Producción: accesibilidad (A5) | Lighthouse en 7 pantallas × celular y escritorio, repetido hoy | ✅ 100 en las 14 auditorías |
| Proceso AI-DLC | Revisión de `docs/`, `prompts.md` y el historial de git contra `CLAUDE.md` | ✅ con 2 observaciones menores (§4) |

## 3. Resultado por requerimiento

### Atributos
| ID | Requerimiento | Prueba del criterio de aceptación | Producción | Resultado |
|---|---|---|---|---|
| A1 | CRUD de empleados (con baja en lugar de eliminar) | `empleados.test.tsx` "se crea, aparece en la lista, se edita y se da de baja"; `store.test.ts` | `operations-produccion.md`, `iteracion-6-produccion.md` | ✅ Cumple |
| A2 | Permisos con y sin goce | `SeccionPermisos.test.tsx` "un permiso de cada tipo queda en el historial" | `operations-produccion.md` | ✅ Cumple |
| A3 | Aumentos y salario vigente | `salario.test.ts` y `SeccionAumentos.test.tsx`: $10,000 + $11,500 → vigente $11,500 | `operations-produccion.md` | ✅ Cumple |
| A4 | Antigüedad | `antiguedad.test.ts`: 15/03/2020 → "6 años 8 meses" | `operations-produccion.md` | ✅ Cumple |
| A5 | Interfaz accesible | `accesibilidad.test.tsx` (axe en 7 escenarios y etiquetas asociadas en todos los campos) | Lighthouse 100 en 14 de 14 (hoy) | ✅ Cumple: supera el ≥ 90 pedido |
| A6 | Vacaciones LFT art. 76 | `vacaciones.test.ts` y `SeccionVacaciones.test.tsx`: corresponden 22, usados 5, restantes 17 | `iteracion-3-produccion.md` | ✅ Cumple |
| A7 | Empleados de ejemplo | `ejemplos.test.ts` (10 pruebas, incluidas las reglas R1–R7) | Hoy: navegador sin datos → María y Carlos con "Ejemplo" y sin "Eliminar" | ✅ Cumple (ver O2) |
| A8 | Baja de empleados | `empleados.test.tsx` (ex empleados, solo consulta, filtro) y `baja.test.ts` | `iteracion-6-produccion.md` y 14 capturas | ✅ Cumple |
| A9 | Panel de resumen de RH | `panel.test.ts` y `Panel.test.tsx` con el ejemplo exacto (activos 2, altas 1, bajas 1; nómina $31,500, +$5,000, +18.9 %; Ana ausente hasta el 24/11) | `iteracion-7-produccion.md` y capturas | ✅ Cumple |

### Restricciones
| ID | Restricción | Prueba del caso de prueba | Resultado |
|---|---|---|---|
| R1 | Datos obligatorios | `empleado.test.ts` y `empleados.test.tsx`: sin fecha de ingreso → bloqueado y se marca el campo | ✅ Cumple |
| R2a | Fin no anterior al inicio | `permiso.test.ts` y `SeccionPermisos.test.tsx`: 10/12 → 05/12 bloqueado | ✅ Cumple |
| R2b | Salario válido | `salario.test.ts` ($9,500 < $10,000 bloqueado; igual al vigente bloqueado) y `empleado.test.ts` ($0 bloqueado) | ✅ Cumple |
| R2c | Fechas contra el ingreso | `permiso.test.ts`, `salario.test.ts` y `empleado.test.ts` (ingreso futuro; mover el ingreso después del primer movimiento) | ✅ Cumple |
| R3 | Salario mínimo $9,582.47 | `salarioMinimo.test.ts` y `empleado.test.ts`: $9,000 bloqueado, $9,582.47 aceptado | ✅ Cumple hoy (ver O1) |
| R4 | 18 años al ingreso | `empleado.test.ts` y `empleados.test.tsx`: 19/05/2023 bloqueado, 20/05/2023 aceptado | ✅ Cumple |
| R5 | NSS de 11 dígitos, único entre activos | `empleado.test.ts` (duplicado, 10 y 12 dígitos, letras) y `empleados.test.tsx` (recontratación con aviso) | ✅ Cumple |
| R6 | Saldo de vacaciones | `permiso.test.ts` y `SeccionPermisos.test.tsx`: 20 laborables con 17 restantes bloqueado; menos de 1 año bloqueado | ✅ Cumple |
| R7 | Límite de 100 años | `empleado.test.ts`: 21/11/1925 aceptado, 20/11/1925 bloqueado; aviso al cumplir 101 | ✅ Cumple |
| R8 | Baja consistente | `baja.test.ts`: antes del ingreso, futura, antes del fin de un permiso y antes del último aumento, todas bloqueadas | ✅ Cumple |

Las restricciones también se verificaron en producción en la iteración en que se agregaron (`docs/evidencias/`).

## 4. Cumplimiento de la forma de trabajo (`CLAUDE.md`)
| Lineamiento | Evidencia | Resultado |
|---|---|---|
| Stack React + Vite + TS en Vercel | `package.json`, `vercel.json`; despliegue automático desde GitHub | ✅ |
| AI-DLC con Inception, Construction y Operations | Un documento de Inception por iteración, con plan de Construction, decisiones y sección de Operations | ✅ (ver O3) |
| Plan aprobado antes de escribir código | Cada Inception registra la frase de aprobación; los commits `feat` son posteriores a ella | ✅ |
| Preguntar ante ambigüedad | Preguntas y respuestas registradas en las secciones "Decisiones" y en `prompts.md` | ✅ |
| Commits pequeños por requerimiento | 57 commits con prefijo por requerimiento, como `feat(R7)` o `docs(A9)` | ✅ |
| Registro de prompts | `docs/prompts.md` con los 24 prompts, su fase y su resultado | ✅ |

## 5. Observaciones
| # | Observación | Impacto | Prioridad |
|---|---|---|---|
| O1 | **El salario mínimo está fijo en 2026** (`domain/salarioMinimo.ts`). El 01/01/2027 entra en vigor el nuevo salario mínimo y R3 seguirá validando contra $9,582.47 hasta que alguien cambie el código. | R3 dejaría de cumplirse en 5 semanas | **Alta** |
| O2 | **El texto de A7 en `requerimientos.md` quedó desactualizado frente a A8 y R7.** Dice que los ejemplos "no se pueden eliminar" y que cumplen "R1–R6". Desde v1.6 nadie se elimina y los ejemplos se pueden dar de baja; además cumplen también R7. El comportamiento es correcto; solo el documento está desfasado. | Confusión al leer el requerimiento | Baja |
| O3 | **La iteración 4 (A7) no tiene documento de Inception ni archivo de evidencia propios.** Se resolvió en un solo prompt (#17), y la evidencia en producción quedó en el panel de la iteración 7 y en esta evaluación. | Trazabilidad incompleta | Baja |
| O4 | **Los datos solo viven en el `localStorage` del navegador.** No se comparten entre equipos ni usuarios, se pierden si se borran los datos del sitio y no hay respaldo. | Limita el uso real fuera de una demostración | Alta para producción real |
| O5 | **No hay autenticación y los datos personales se guardan sin cifrar** (NSS, fecha de nacimiento, salario). En una organización real habría que cumplir la LFPDPPP (aviso de privacidad, control de acceso, bitácora). | Riesgo de privacidad | Alta para producción real |
| O6 | **No se pueden corregir ni cancelar permisos y aumentos ya registrados.** Un error de captura queda en el historial, afecta el saldo de vacaciones y el panel, y puede bloquear una baja (R8). | Operación diaria | Media |
| O7 | **Dos pestañas abiertas pueden sobrescribirse los cambios**, porque el store no escucha el evento `storage`. | Pérdida de datos poco probable | Baja |
| O8 | **Vulnerabilidades en dependencias de desarrollo.** `npm audit` reporta tinypool (crítica) y @vitest/mocker (moderada) a través de Vitest 3. No llegan al bundle de producción (`npm audit --omit=dev`: 0), pero sí al entorno de CI y de desarrollo. | Seguridad de la cadena de desarrollo | Media |
| O9 | **Las verificaciones en producción (Lighthouse y recorridos) se hacen con scripts que no están en el repositorio.** Hoy dependen de que alguien los ejecute a mano después de cada despliegue. | Repetibilidad | Media |

## 6. Recomendaciones para mejoras futuras

### Corto plazo (siguiente iteración)
1. **Salario mínimo por año (O1):**
   - cambiar la constante por una tabla `{ anio, diario }` y tomar la vigente según la fecha del salario o del aumento;
   - agregar el valor 2027 cuando CONASAMI lo publique en diciembre;
   - mostrar un aviso cuando el año en curso no tenga valor registrado.
2. **Actualizar A7 en `requerimientos.md` (O2)** para que diga "se pueden dar de baja" y "R1–R7". Es un cambio de requerimiento, así que requiere aprobación.
3. **Actualizar Vitest a v5 (O8)** y agregar `npm audit --omit=dev` al CI.
4. **Pruebas de extremo a extremo en el repositorio (O9):**
   - llevar los recorridos de producción a Playwright, con la auditoría de accesibilidad y las capturas;
   - ejecutarlos en CI contra el despliegue de vista previa de Vercel;
   - agregar un reporte de cobertura (`@vitest/coverage-v8`).

### Mediano plazo (funcionalidad de RH)
5. **Corrección de movimientos (O6):** cancelar un permiso o aumento con motivo, sin borrarlo del historial. Así se conserva la trazabilidad, igual que con la baja.
6. **Más indicadores en el panel**, los que quedaron fuera de alcance en la iteración 7:
   - selector de mes;
   - rotación de personal (bajas ÷ plantilla promedio) y motivos de baja;
   - costo patronal (IMSS, ISN, prestaciones);
   - filtro por departamento.
7. **Exportar e importar datos** en CSV o JSON, como respaldo mientras no haya servidor y para entregar reportes (O4).
8. **Más procesos de RH:**
   - prima vacacional (LFT art. 80, mínimo 25 %);
   - aguinaldo (art. 87);
   - vacaciones pendientes de periodos anteriores (art. 81: 6 meses para disfrutarlas);
   - expediente con documentos (contrato, identificación).
9. **Sincronizar pestañas (O7)** escuchando el evento `storage` en el store.

### Largo plazo (uso real en una organización)
10. **Servidor y base de datos (O4).** La interfaz `Almacenamiento` en `data/almacenamiento.ts` ya permite cambiar la persistencia sin tocar la interfaz. Bastaría con una API en Vercel Functions y una base de datos de Vercel Marketplace (por ejemplo, Neon Postgres).
11. **Autenticación y roles (O5):** por ejemplo, administrador de RH con edición completa, gerente con consulta de su departamento y empleado con consulta de su propio expediente. Además: bitácora de cambios, cifrado de datos sensibles y aviso de privacidad (LFPDPPP).
12. **Validaciones también en el servidor:** las reglas de `src/domain` son funciones puras, así que pueden compartirse entre el cliente y la API sin duplicarse.

## 7. Conclusión
La aplicación cumple todos los requerimientos de `requerimientos.md` v1.7, con pruebas automatizadas que reproducen cada criterio de aceptación y verificación en producción. La forma de trabajo definida en `CLAUDE.md` se siguió en las 7 iteraciones.

Para seguir usándola como demostración, solo hace falta atender O1 antes de enero de 2027. Para usarla en una organización real, la prioridad son O4 y O5: servidor, autenticación y protección de datos personales.
