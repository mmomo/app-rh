# Requerimientos: Sistema de Control de RR. HH.

> Versión: 1.4

## 1. Contexto
App para administrar la información del personal de una organización, que facilite la gestión de empleados y diversos procesos relacionados con recursos humanos.


## 2. Atributos
| ID | Atributo | Descripción | Criterio de aceptación | Origen |
|---|---|---|---|---|
| A1 | CRUD de empleados | Registrar, consultar, modificar y eliminar empleados. | Se crea un empleado, aparece en la lista, se edita y se elimina, y cada cambio se refleja. | Instrucciones del reto |
| A2 | Permisos | Registrar permisos con goce y sin goce de sueldo por empleado. | Un permiso de cada tipo queda en el historial del empleado con su tipo visible. | Instrucciones del reto |
| A3 | Aumentos salariales | Registrar aumentos; el salario vigente se actualiza solo. | Salario $10,000 + aumento a $11,500 → el detalle muestra $11,500 vigente y el historial ambos. | Instrucciones del reto |
| A4 | Antigüedad | Calcular y mostrar la antigüedad desde la fecha de ingreso. | Ingreso 15/03/2020, hoy 19/11/2026 → "6 años 8 meses". | Instrucciones del reto |
| A5 | Interfaz clara | La interfaz es accesible: todos los campos tienen etiqueta visible y asociada, y la app obtiene puntaje de Accesibilidad en Lighthouse ≥ 90. | Auditoría Lighthouse de la lista, el formulario y el detalle de empleado → Accesibilidad ≥ 90 en cada una. | Instrucciones del reto |

| A6 | Vacaciones | Mostrar los días de vacaciones que corresponden a cada empleado según la LFT art. 76, cuántos ha usado y cuántos le quedan en el periodo vacacional vigente (del último aniversario de ingreso al siguiente; sin acumular periodos anteriores). Las vacaciones se registran como un tipo de permiso y se cuentan en días laborables de lunes a viernes. | Ingreso 15/03/2020, hoy 20/11/2026 → corresponden 22; vacaciones del lunes 30/11/2026 al domingo 06/12/2026 → usados 5, restantes 17. | Cliente (iteración 3) |
| A7 | Empleados de ejemplo | Dos empleados ficticios siempre presentes como ejemplo: se agregan al cargar la app si faltan (también a quien ya tiene datos), se pueden editar y no se pueden eliminar. Cumplen todas las reglas (R1–R6). | Navegador sin datos → la lista muestra a María Fernanda González Ruiz y Carlos Alberto Méndez Torres con la etiqueta "Ejemplo" y sin botón Eliminar. | Cliente (iteración 4) |

## 3. Restricciones
| ID | Restricción | Regla (Dado / Cuando / Entonces) | Caso de prueba | Origen |
|---|---|---|---|---|
| R1 | Datos obligatorios | Dado el alta de un empleado, cuando falta un campo obligatorio, entonces no se guarda y se marca el campo. | Guardar sin fecha de ingreso → bloqueado. | Instrucciones del reto |
| R2a | Fechas consistentes | Dado un permiso, cuando la fecha de fin es anterior a la de inicio, entonces se rechaza. | Inicio 10/12, fin 05/12 → bloqueado. | Asesora |
| R2b | Salario válido | Dado un salario inicial o un aumento, cuando el monto es ≤ 0, o cuando un aumento no es mayor al salario vigente, entonces se rechaza. | Vigente $10,000, aumento a $9,500 → bloqueado; salario inicial $0 → bloqueado. | Instrucciones del reto |
| R2c | Fechas vs. ingreso | Dada una fecha de ingreso, cuando es posterior a hoy, entonces se rechaza; dado un permiso o aumento, cuando su fecha es anterior a la fecha de ingreso, entonces se rechaza. | Ingreso 15/03/2020, permiso con inicio 01/01/2020 → bloqueado. | Instrucciones del reto |
| R3 | Salario mínimo | Los salarios se capturan **mensuales**. Dado un salario inicial o un aumento, cuando el monto es menor al salario mínimo general mensual vigente (2026: $315.04 diarios × 365/12 = **$9,582.47**), entonces se rechaza. | Salario inicial $9,000 → bloqueado; $9,582.47 → aceptado. | Cliente (iteración 2) |
| R4 | Edad mínima legal | Dado el alta o edición de un empleado, cuando a su **fecha de ingreso** tiene menos de 18 años según su fecha de nacimiento (obligatoria), entonces no se guarda y se marca el campo. | Nacimiento 20/05/2005, ingreso 19/05/2023 → bloqueado; ingreso 20/05/2023 → aceptado. | Cliente (iteración 2) |
| R5 | NSS único | El NSS es obligatorio y tiene exactamente 11 dígitos. Dado el alta o edición de un empleado, cuando su NSS ya está asignado a otro empleado, entonces no se guarda y se marca el campo. | Ana con NSS 12345678901; alta de Luis con 12345678901 → bloqueado; NSS de 10 dígitos → bloqueado. | Cliente (iteración 2) |

| R6 | Saldo de vacaciones | Dado el registro de vacaciones, cuando los días laborables (lunes a viernes) exceden el saldo del periodo vacacional en que inician, o el empleado aún no cumple un año de servicio, o el rango no incluye días laborables, entonces se rechaza y se marca el campo. | Le quedan 17 días; vacaciones de 4 semanas (20 días laborables) → bloqueado. Ingreso hace 6 meses → bloqueado. | Cliente (iteración 3) |

## Historial de cambios
| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-11-19 | Versión inicial |
| 1.1 | 2026-11-19 | Se definen A5, R2b y R2c (Inception). |
| 1.2 | 2026-11-20 | Se agregan R3 (salario mínimo), R4 (edad mínima) y R5 (NSS único); reglas en Inception de la iteración 2. |
| 1.3 | 2026-11-20 | Se agregan A6 (vacaciones disponibles, usadas y restantes) y R6 (saldo de vacaciones). |
| 1.4 | 2026-11-20 | Se agrega A7 (empleados de ejemplo siempre presentes). |