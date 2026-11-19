# Requerimientos: Sistema de Control de RR. HH.

> Versión: 1.0

## 1. Contexto
App para administrar la información del personal de una organización, que facilite la gestión de empleados y diversos procesos relacionados con recursos humanos.


## 2. Atributos
| ID | Atributo | Descripción | Criterio de aceptación | Origen |
|---|---|---|---|---|
| A1 | CRUD de empleados | Registrar, consultar, modificar y eliminar empleados. | Se crea un empleado, aparece en la lista, se edita y se elimina, y cada cambio se refleja. | Instrucciones del reto |
| A2 | Permisos | Registrar permisos con goce y sin goce de sueldo por empleado. | Un permiso de cada tipo queda en el historial del empleado con su tipo visible. | Instrucciones del reto |
| A3 | Aumentos salariales | Registrar aumentos; el salario vigente se actualiza solo. | Salario $10,000 + aumento a $11,500 → el detalle muestra $11,500 vigente y el historial ambos. | Instrucciones del reto |
| A4 | Antigüedad | Calcular y mostrar la antigüedad desde la fecha de ingreso. | Ingreso 15/03/2020, hoy 19/11/2026 → "6 años 8 meses". | Instrucciones del reto |
| A5 | Interfaz clara | [Hazlo medible: ¿qué significa "clara"?] | [...] | Instrucciones del reto |


## 3. Restricciones
| ID | Restricción | Regla (Dado / Cuando / Entonces) | Caso de prueba | Origen |
|---|---|---|---|---|
| R1 | Datos obligatorios | Dado el alta de un empleado, cuando falta un campo obligatorio, entonces no se guarda y se marca el campo. | Guardar sin fecha de ingreso → bloqueado. | Instrucciones del reto |
| R2a | Fechas consistentes | Dado un permiso, cuando la fecha de fin es anterior a la de inicio, entonces se rechaza. | Inicio 10/12, fin 05/12 → bloqueado. | Asesora |
| R2b | Salario válido | [...] | [...] | Instrucciones del reto |
| R2c | [Otra consistencia] | [...] | [...] | Instrucciones del reto |


## Historial de cambios
| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-11-19 | Versión inicial |