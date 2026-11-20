# Inception — Iteración 3: vacaciones

> Estado: **BORRADOR — pendiente de aprobación**
> Fecha: 2026-11-20
> Fuente: `docs/requerimientos.md` v1.3 (A6)

## 1. Requerimiento (tal como se recibió)
Mostrar los días de vacaciones disponibles que corresponden a cada empleado, cuántos ha usado y cuántos le quedan.

## 2. Investigación — LFT art. 76 (reforma "vacaciones dignas", DOF 27/12/2022, vigente desde 01/01/2023)

| Años de servicio cumplidos | Días de vacaciones |
|---|---|
| 1 | 12 |
| 2 | 14 |
| 3 | 16 |
| 4 | 18 |
| 5 | 20 |
| 6–10 | 22 |
| 11–15 | 24 |
| 16–20 | 26 |
| 21–25 | 28 |
| 26–30 | 30 |
| 31–35 | 32 |

- **Regla general:** 12 días al cumplir el primer año, +2 por año hasta el quinto (20), y a partir del sexto, +2 por cada 5 años. Se calcula con una fórmula, sin límite de años.
- **Con menos de un año** cumplido aún no se tiene derecho a vacaciones (0 días).
- **Días laborables:** la ley habla de días laborables, no naturales.
- **Plazo:** las vacaciones deben concederse dentro de los 6 meses siguientes al cumplimiento del año de servicios.
- La **prima vacacional** (25% mínimo) queda fuera del alcance: el requerimiento solo pide días.

## 3. Propuesta de solución
- **Saldo del periodo vigente:** el "periodo vacacional" va del último aniversario de ingreso al siguiente. En él corresponden los días del último año cumplido.
  - Ej.: ingreso 15/03/2020; hoy 20/11/2026. Cumplió 6 años el 15/03/2026, así que le corresponden **22 días** para el periodo 15/03/2026–14/03/2027.
- **Días usados:** se suman los días de vacaciones registrados cuyo inicio cae dentro del periodo vigente.
- **Días restantes** = corresponden − usados.
- **Dónde se muestra:**
  - **Detalle:** una sección "Vacaciones" con tres cifras (corresponden / usados / restantes), el periodo y el historial de vacaciones.
  - **Lista:** una columna "Vacaciones restantes".
- **Empleados con menos de un año:** se muestra "Aún sin derecho a vacaciones; tendrá 12 días a partir del dd/mm/aaaa".

## 4. Historias de usuario
| ID | Historia | Req. |
|---|---|---|
| HU11 | Como encargado de RR. HH., quiero registrar las vacaciones que toma un empleado. | A6 |
| HU12 | Quiero ver cuántos días de vacaciones le corresponden, cuántos ha usado y cuántos le quedan. | A6 |

## 5. Preguntas abiertas (bloquean la aprobación)
1. **Registro:** ¿las vacaciones se registran como un nuevo tipo de permiso o en una sección aparte?
2. **Conteo de días usados:** ¿días laborables lunes a viernes, lunes a sábado o días naturales?
3. **Días no usados:** ¿se acumulan de un periodo al siguiente o solo cuenta el periodo vigente?
4. **Exceder el saldo:** ¿se bloquea registrar más días de los que le quedan?

## 6. Plan de Construction (borrador, se ajusta según las respuestas)
1. Dominio: días por antigüedad (art. 76), periodo vigente, conteo de días usados, saldo. Con pruebas, incluida la tabla completa.
2. Registro de vacaciones (según la pregunta 1) y validación del saldo (según la pregunta 4).
3. Interfaz: sección de vacaciones en el detalle y columna en la lista.
4. Verificación: pruebas, axe y Lighthouse (A5 ≥ 90), despliegue automático y verificación en producción.
