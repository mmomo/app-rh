# Inception — Iteración 2: salario mínimo, edad mínima y NSS

> Estado: **BORRADOR — pendiente de aprobación**
> Fecha: 2026-11-20
> Fuente: `docs/requerimientos.md` v1.2 (R3, R4, R5)

## 1. Requerimientos nuevos (tal como se recibieron)
1. No se puede registrar un salario por debajo del salario mínimo mexicano actual.
2. Edad mínima legal: no registrar empleados menores de edad.
3. Cada empleado debe tener un NSS (número de seguridad social) único; no deben repetirse.

## 2. Investigación

### R3 — Salario mínimo 2026 (CONASAMI, DOF 09/12/2025, vigente desde 01/01/2026)
| Zona | Diario | Mensual (× 365/12 = 30.4167 días) |
|---|---|---|
| Salario mínimo general | $315.04 | $9,582.47 |
| Zona Libre de la Frontera Norte (ZLFN, 45 municipios fronterizos) | $440.87 | $13,409.80 |

El monto cambia cada 1 de enero, así que debe quedar en un solo lugar del código, con su año y fuente.

### R4 — Edad mínima
- "Menor de edad" en México significa menor de 18 años, y se toma como regla R4.
- La Ley Federal del Trabajo permite trabajar desde los 15 años con restricciones. El requerimiento pide expresamente excluir a los menores de edad, así que se usa 18.
- Hoy la app no guarda la fecha de nacimiento, así que hay que **agregar el campo `fechaNacimiento` (obligatorio)**.

### R5 — NSS
- El NSS del IMSS tiene **11 dígitos**. El último es un dígito verificador que se calcula con el algoritmo de Luhn sobre los 10 anteriores.
- Hay que **agregar el campo `nss` (obligatorio)**.
- Validar el dígito verificador rechazaría NSS ficticios de prueba; se decidió no validarlo (ver §5).

## 3. Impacto en la aplicación
| Área | Cambio |
|---|---|
| Modelo `Empleado` | Nuevos campos `fechaNacimiento` y `nss`. |
| Formulario de empleado | Dos campos nuevos con validación y errores junto al campo (mantiene A5). |
| Validación de aumentos | El nuevo salario también debe cumplir R3. Ya debe ser mayor que el vigente (R2b), así que R3 solo cambia algo si el vigente quedó por debajo del mínimo (datos previos). |
| Etiquetas | "Salario inicial (MXN)" pasa a "Salario mensual inicial (MXN)"; "Nuevo salario" pasa a "Nuevo salario mensual". |
| Detalle / lista | Mostrar NSS y edad en el detalle. |
| **Datos existentes** | Los empleados ya guardados en `localStorage` no tienen NSS ni fecha de nacimiento. Ver pregunta 5. |

**Limitación conocida (R5):** con `localStorage`, la unicidad del NSS solo se puede garantizar dentro del mismo navegador. Dos personas en navegadores distintos podrían registrar el mismo NSS. Garantizarla para toda la organización requiere un backend compartido, que no está en el alcance de esta iteración.

## 4. Historias de usuario
| ID | Historia | Req. |
|---|---|---|
| HU8 | Como encargado de RR. HH., quiero que el sistema rechace salarios por debajo del mínimo legal para no incumplir la ley. | R3 |
| HU9 | Quiero capturar la fecha de nacimiento y que el sistema impida registrar menores de edad. | R4 |
| HU10 | Quiero capturar el NSS de cada empleado y que el sistema impida duplicados. | R5 |

## 5. Decisiones (2026-11-20)
| Tema | Decisión |
|---|---|
| Periodicidad del salario | **Mensual** (todos los montos de la app). |
| Zona salarial | **Mínimo general** para todos: $315.04 diarios = **$9,582.47 mensuales** (2026). |
| Referencia de la edad | **Fecha de ingreso**: debía tener 18 años cumplidos al ingresar. |
| Formato del NSS | **Exactamente 11 dígitos**, sin dígito verificador (admite NSS de prueba). Se recortan los espacios de los extremos; no se aceptan guiones ni espacios internos. |
| Datos existentes | Se conservan. El detalle y la lista muestran el aviso **"Datos incompletos"** y, al editar, NSS y fecha de nacimiento son obligatorios como en el alta. |

Los cambios se reflejan en `docs/requerimientos.md` v1.2.

## 6. Plan de Construction (un commit por requerimiento)
1. R3: constante del salario mínimo 2026 y validación en el alta, la edición y los aumentos, con pruebas.
2. R4: campo `fechaNacimiento`, cálculo de edad y validación, con pruebas.
3. R5: campo `nss`, validación de formato y unicidad, con pruebas.
4. Datos existentes: aviso "Datos incompletos" en la lista y el detalle, con pruebas.
5. Verificación: pruebas automatizadas, accesibilidad con axe y Lighthouse (A5 ≥ 90), despliegue y verificación en producción.

## 7. Pendiente de aprobación
- Plan de Construction (§6).
