# Inception — Iteración 6: baja de empleados

> Estado: **APROBADO** (2026-11-21)
> Fecha: 2026-11-21
> Fuente: `docs/requerimientos.md` v1.6 (A8, R8; cambios en A1 y R5)

## 1. Requerimiento (tal como se recibió)
En lugar de eliminar un empleado, darlo de baja. Esto significa que ya no es empleado activo, pero se queda el registro del empleado bajo la etiqueta de ex empleado.

## 2. Impacto
- **A1 (CRUD):** la "D" deja de ser eliminar. Ya no existe eliminar en la interfaz ni en el store; se reemplaza por **dar de baja**.
- **R5 (NSS único):** como la baja es definitiva y una persona puede volver a ser contratada como empleado nuevo, el NSS solo debe ser único **entre empleados activos**.
- **A4, A6 y R7:** dejan de aplicar igual a un ex empleado:
  - la antigüedad se calcula hasta la fecha de baja;
  - ya no tiene saldo de vacaciones;
  - el límite de 100 años es para quien sigue trabajando.
- **A7 (ejemplos):** los ejemplos se pueden dar de baja como cualquier empleado; su registro permanece, así que no se vuelven a agregar.

## 3. Propuesta de solución

### Modelo de datos
```ts
type MotivoBaja = 'RENUNCIA' | 'DESPIDO' | 'FIN_CONTRATO' | 'JUBILACION' | 'OTRO'

type Empleado = {
  // …campos actuales
  baja?: { fecha: string; motivo: MotivoBaja; comentario?: string }  // sin baja = activo
}
```
Los datos guardados no requieren migración: los registros sin `baja` son empleados activos.

### Dar de baja
- **Dónde:** el botón "Eliminar" se reemplaza por **"Dar de baja"** en la lista y en el detalle. Lleva a la pantalla `/empleados/:id/baja`.
- **Formulario:**
  - fecha de baja (obligatoria);
  - motivo: Renuncia, Despido, Término de contrato, Jubilación u Otro (obligatorio);
  - comentario (opcional).
- **Validación (R8):**
  - la fecha no puede ser futura;
  - no puede ser anterior a la fecha de ingreso;
  - no puede ser anterior al último aumento ni al fin del último permiso registrado.
- **Confirmación:** la pantalla advierte que la baja es definitiva antes de guardar.

### Ex empleados
- **Lista:**
  - un filtro **Activos / Ex empleados / Todos** con el número de cada grupo; por omisión muestra Activos;
  - el filtro se combina con la búsqueda por nombre;
  - los ex empleados llevan la etiqueta **"Ex empleado"**;
  - en la columna de vacaciones muestran "—" y su única acción es "Ver".
- **Detalle (solo consulta):**
  - etiqueta "Ex empleado" junto al nombre y un recuadro "Baja: dd/mm/aaaa · Motivo · Comentario";
  - antigüedad calculada hasta la fecha de baja; el salario se rotula "Último salario";
  - historial de aumentos y permisos visible, sin formularios de registro;
  - sin sección de vacaciones, sin botones Editar ni Dar de baja, y sin los avisos de datos incompletos ni de 100 años;
  - si se intenta entrar a `/empleados/:id/editar` de un ex empleado, se muestra un aviso de que no se puede editar.
- **NSS (R5 ajustada):**
  - al dar de alta a alguien con el NSS de un ex empleado, se permite;
  - debajo del campo se informa "Este NSS perteneció a X (ex empleado, baja dd/mm/aaaa)".

## 4. Historias de usuario
| ID | Historia | Req. |
|---|---|---|
| HU17 | Como encargado de RR. HH., quiero dar de baja a un empleado con fecha y motivo, conservando su expediente. | A8, R8 |
| HU18 | Quiero ver por separado a los empleados activos y a los ex empleados. | A8 |
| HU19 | Quiero consultar el expediente de un ex empleado sin que se modifique por error. | A8 |
| HU20 | Quiero recontratar a un ex empleado como alta nueva con el mismo NSS. | R5 |

## 5. Decisiones (2026-11-21)
| Tema | Decisión |
|---|---|
| Datos de la baja | Fecha y motivo obligatorios; comentario opcional. |
| Lista | Filtro Activos / Ex empleados / Todos; por omisión, Activos. |
| Reingreso | No: la baja es definitiva. Quien vuelve se da de alta como nuevo; su NSS no bloquea porque R5 aplica solo entre activos. |
| Ex empleado | Solo consulta: sin editar ni registrar permisos, aumentos o vacaciones. |

### Detalles propuestos (incluidos en el plan a aprobar)
- Se quita por completo la opción de eliminar, también para empleados que no son de ejemplo.
- La baja no puede ser anterior al último aumento ni al fin del último permiso. Si tiene vacaciones futuras registradas, no se puede dar de baja antes de que terminen.
- La antigüedad de un ex empleado se congela en la fecha de baja; los avisos de R7 y de datos incompletos solo se muestran a activos.

## 6. Plan de Construction (un commit por requerimiento) — ✅ completado 2026-11-21
1. **A8 — dominio y store:**
   - tipo `Baja`, `validarBaja` (R8), `esActivo`, y antigüedad a la fecha de baja;
   - `store.darDeBaja`; se quita `eliminarEmpleado`;
   - pruebas.
2. **A8 — interfaz de baja:** pantalla `/empleados/:id/baja`; "Dar de baja" reemplaza a "Eliminar" en la lista y el detalle; pruebas de interfaz.
3. **A8 — ex empleados:** filtro de la lista, etiqueta y detalle de solo consulta; bloqueo de edición; pruebas de interfaz y de accesibilidad.
4. **R5 — NSS único entre activos:** se permite el NSS de un ex empleado y se muestra el aviso; pruebas.

**Operations:** push a `main` (CI y despliegue automático), verificación en producción y Lighthouse Accesibilidad ≥ 90 en lista, formulario de baja y detalle de ex empleado.

## 7. Aprobación
Plan aprobado el 2026-11-21 ("Apruebo"). Desde esta iteración, cada despliegue incluye capturas de pantalla de producción (`docs/evidencias/capturas/`).

## 8. Decisiones tomadas durante Construction
- `eliminarEmpleado` se quitó del store en el commit de la interfaz (paso 2), junto con los botones que lo usaban, para que cada commit compile.
- La pantalla de baja limita la fecha (`min`/`max`) y explica el rango permitido debajo del campo.
- Si se entra por URL a `/editar` o `/baja` de un ex empleado, se muestra un aviso con enlace al expediente.
- `store.actualizarEmpleado` conserva la baja aunque se llame sobre un ex empleado.

## 9. Operations
✅ Desplegado y verificado en producción el 2026-11-21, con capturas de escritorio y móvil (ver `docs/evidencias/iteracion-6-produccion.md`).
