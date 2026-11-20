# Requerimientos: Sistema de Control de RR. HH.

> Versión: 1.3 (borrador: A6 en Inception)

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

| A6 | Vacaciones | Mostrar los días de vacaciones que corresponden a cada empleado según la LFT, cuántos ha usado y cuántos le quedan. | [Pendiente: depende de cómo se registran y cuentan los días usados] | Cliente (iteración 3) |

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


## Historial de cambios
| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-11-19 | Versión inicial |
| 1.1 | 2026-11-19 | Se definen A5, R2b y R2c (Inception). |
| 1.2 | 2026-11-20 | Se agregan R3 (salario mínimo), R4 (edad mínima) y R5 (NSS único); reglas en Inception de la iteración 2. |
| 1.3 | 2026-11-20 | Se agrega A6 (vacaciones disponibles, usadas y restantes); reglas en Inception de la iteración 3. |