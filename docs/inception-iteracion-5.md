# Inception — Iteración 5: límite de 100 años

> Estado: **APROBADO** (2026-11-20)
> Fecha: 2026-11-20
> Fuente: `docs/requerimientos.md` v1.5 (R7)

## 1. Requerimiento (tal como se recibió)
Empleados no pueden tener más de 100 años de edad ni de contratación. Esto significa, no puede haber un empleado trabajando más de 100 años en la empresa.

## 2. Análisis
- **Dos límites:** edad actual ≤ 100 años y antigüedad ≤ 100 años, ambos en años cumplidos a **hoy**.
- **"Más de 100":** 100 años cumplidos se aceptan; 101 se rechazan.
  - Ej. con hoy = 20/11/2026: nacimiento 21/11/1925 → 100 años, se acepta. Nacimiento 20/11/1925 → 101 años, se rechaza.
- **Relación con R4:** como el empleado debe tener al menos 18 años al ingresar, una edad ≤ 100 implica una antigüedad ≤ 82. Aun así se valida la antigüedad por separado:
  - el requerimiento la pide explícitamente;
  - cubre registros anteriores a v1.2 que no tienen fecha de nacimiento.
- **El límite cambia con el tiempo:** un empleado guardado hoy con 100 años pasa a 101 el día de su cumpleaños sin que nadie lo edite. Por eso, además de validar al guardar, se avisa en los registros existentes.

## 3. Propuesta de solución
- **Validación al guardar (alta y edición):**
  - **Fecha de nacimiento:** si la edad a hoy es mayor a 100: "Tendría N años; la edad máxima es 100." El campo se marca.
  - **Fecha de ingreso:** si la antigüedad a hoy es mayor a 100: "Tendría N años de antigüedad; el máximo es 100." El campo se marca.
- **Aviso en registros existentes:**
  - **Lista:** etiqueta "Supera 100 años" junto al nombre, igual que "Datos incompletos".
  - **Detalle:** alerta que explica qué límite rebasa, con un enlace "Corregir datos" al formulario de edición.
  - El registro se puede consultar y eliminar; al editarlo no se guarda hasta corregir la fecha.
- **Empleados de ejemplo (A7):** María (41 años, 8 de antigüedad) y Carlos (25 años, 8 meses) cumplen la regla; se agrega a la prueba de que los ejemplos cumplen todas las reglas.

## 4. Historias de usuario
| ID | Historia | Req. |
|---|---|---|
| HU15 | Como encargado de RR. HH., quiero que no se pueda registrar una edad o antigüedad mayor a 100 años, para evitar fechas mal capturadas. | R7 |
| HU16 | Quiero ver un aviso en los empleados que ya rebasaron el límite, para corregirlos. | R7 |

## 5. Decisiones (2026-11-20)
| Tema | Decisión |
|---|---|
| Fecha de referencia de la edad | **Hoy** (edad actual), no la fecha de ingreso. |
| Registros que rebasan el límite con el tiempo | **Aviso** en lista y detalle; **bloqueo al editar** hasta corregir. |

### Detalles propuestos (incluidos en el plan a aprobar)
- 100 años cumplidos se aceptan; el rechazo empieza en 101.
- La antigüedad se valida también por separado de la edad.

## 6. Plan de Construction (un commit por requerimiento) — ✅ completado 2026-11-20
1. **R7 — validación:** `EDAD_MAXIMA = 100` y `ANTIGUEDAD_MAXIMA = 100` en el dominio; `validarEmpleado` rechaza edad o antigüedad mayores; función `excesoDeAnios(empleado, hoy)` para los avisos. Pruebas de los casos límite (100 aceptado, 101 rechazado) y de que los ejemplos cumplen R7.
2. **R7 — aviso:** etiqueta en la lista y alerta en el detalle, con pruebas de interfaz y de accesibilidad.

**Operations:** push a `main` (CI y despliegue automático en Vercel), verificación en producción y Lighthouse Accesibilidad ≥ 90.

## 7. Aprobación
Plan aprobado el 2026-11-20 ("Continua").

## 8. Operations
✅ Desplegado y verificado en producción el 2026-11-20 (ver `docs/evidencias/iteracion-5-produccion.md`).
