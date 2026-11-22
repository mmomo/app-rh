# Inception — Iteración 7: panel de resumen de RH

> Estado: **APROBADO** (2026-11-22)
> Fecha: 2026-11-22
> Fuente: `docs/requerimientos.md` v1.7 (A9)

## 1. Requerimiento (tal como se recibió)
Panel de resumen de RH para apoyar en la toma de decisiones. Debe tener los siguientes indicadores:
- **Plantilla activa:** total de activos. ¿Cuánta gente tengo y cómo cambia?
- **Nómina mensual vigente:** suma de los salarios vigentes de los activos.
- **Ausencias:** quién está ausente hoy y permisos del mes.

## 2. Definiciones
Todas las cifras se calculan con los datos ya registrados; no se agregan campos nuevos.

| Concepto | Definición |
|---|---|
| Activo en una fecha *d* | Su fecha de ingreso es *d* o anterior, y no tiene baja o su baja es posterior a *d*. Hoy coincide con "sin baja", porque la baja no puede ser futura (R8). |
| Alta del mes | Fecha de ingreso dentro del mes. |
| Baja del mes | Fecha de baja dentro del mes. |
| Salario en una fecha *d* | El del último aumento con fecha *d* o anterior; si no hay, el salario inicial. Hoy es el salario vigente (A3). |
| Nómina en una fecha *d* | Suma del salario en *d* de los activos en *d*. |
| Mes en curso | Del día 1 del mes actual a hoy. |
| Cierre de un mes | Último día del mes; para el mes en curso, hoy. |
| Ausente hoy | Empleado activo con un permiso de cualquier tipo (con goce, sin goce o vacaciones) cuyo rango incluye hoy. |
| Permisos del mes | Permisos cuyo rango toca el mes en curso, aunque empiecen o terminen fuera de él. Incluye los de empleados que después fueron dados de baja, porque estaban activos en ese momento. |

## 3. Propuesta de solución

### Ubicación
- **Ruta:** nueva ruta `/panel`, que pasa a ser la pantalla de inicio (`/` redirige a `/panel`).
- **Menú:** el encabezado tiene un menú **Panel · Empleados** que marca la página actual con `aria-current="page"`.

### Indicadores
**1. Plantilla activa**
- **Cifras:**
  - activos hoy;
  - altas y bajas del mes en curso;
  - variación neta contra el cierre del mes anterior (por ejemplo, "+1 vs. octubre").
- **Evolución de 12 meses:** gráfica de barras con los activos al cierre de cada uno de los últimos 12 meses, incluido el actual, y las altas y bajas de cada mes.
  - La gráfica se dibuja con SVG propio, sin dependencias nuevas.
  - Tiene una tabla equivalente para lectores de pantalla (A5).

**2. Nómina mensual vigente**
- **Cifras:**
  - suma de salarios vigentes de los activos;
  - variación en monto y porcentaje contra la nómina al cierre del mes anterior;
  - salario promedio (nómina ÷ activos).
- **Desglose por departamento:** monto, número de personas y porcentaje del total, ordenado de mayor a menor monto. Cada departamento lleva una barra horizontal proporcional.

**3. Ausencias**
- **Ausentes hoy:** nombre (con enlace al expediente), tipo de permiso y fecha en que termina. Si no hay nadie: "Nadie está ausente hoy."
- **Permisos del mes:**
  - número de permisos por tipo y número de personas;
  - tabla con empleado, tipo, inicio, fin y días dentro del mes. Los días se cuentan naturales para permisos con y sin goce, y laborables para vacaciones, igual que en el expediente.

### Diseño
- **Arriba:** tres tarjetas con la cifra principal de cada indicador: activos, nómina vigente y ausentes hoy.
- **Abajo:** el detalle de cada indicador en su propia sección.
- **Responsivo:** una columna en celular.
- **Accesibilidad:** Lighthouse ≥ 90, como las demás pantallas.

## 4. Historias de usuario
| ID | Historia | Req. |
|---|---|---|
| HU21 | Como encargado de RR. HH., quiero ver cuántos empleados activos tengo y cómo ha cambiado la plantilla en el último año, para planear contrataciones. | A9 |
| HU22 | Quiero conocer la nómina mensual vigente y cuánto pesa cada departamento, para controlar el costo de personal. | A9 |
| HU23 | Quiero saber quién está ausente hoy y qué permisos hay en el mes, para organizar la operación. | A9 |

## 5. Decisiones (2026-11-22)
| Tema | Decisión |
|---|---|
| "¿Cómo cambia?" | Altas y bajas del mes, variación contra el mes anterior y evolución de los últimos 12 meses. |
| Nómina | Total, variación contra el cierre del mes anterior, salario promedio y desglose por departamento. |
| Periodo | Mes en curso fijo, sin selector de mes. |
| Ubicación | El panel es la página de inicio, con el menú Panel · Empleados. |

### Detalles propuestos (incluidos en el plan a aprobar)
- **Departamentos:** se agrupan por nombre sin distinguir mayúsculas ni espacios extra ("TI" y " ti " son el mismo); se muestra el nombre tal como se capturó primero.
- **Gráficas:** se hacen con SVG y CSS propios, sin agregar una librería de gráficas, para no aumentar el tamaño de la app. Cada gráfica tiene una tabla equivalente accesible.
- **Ausentes hoy:** solo cuenta a los activos. Un ex empleado no puede estar ausente.
- **Fuera de alcance:** rotación, costo patronal (IMSS, ISN, prestaciones), filtros por departamento, exportar y selector de mes.

### Limitaciones de los datos
- **Historial incompleto:** la historia se reconstruye con los registros que existen. Los empleados eliminados antes de v1.6, cuando aún se podía eliminar, no aparecen en la evolución.
- **Ejemplos:** los dos empleados de ejemplo (A7) cuentan como cualquier otro. Con sus fechas, hoy no hay ausencias de ejemplo, así que esa sección mostrará "Nadie está ausente hoy" hasta que se registre un permiso.

## 6. Plan de Construction (un commit por requerimiento) — ✅ completado 2026-11-22
1. **A9 — dominio:** `src/domain/panel.ts` con funciones puras:
   - `activosEn`, `salarioEn` y `nominaEn`;
   - `movimientosDelMes` (altas y bajas) y `evolucionPlantilla(12 meses)`;
   - `nominaPorDepartamento`, `ausentesEn` y `permisosDelMes`.

   Pruebas con el criterio de aceptación y casos límite: baja el último día del mes, aumento a mitad de mes, permiso que cruza meses, departamentos con mayúsculas distintas.
2. **A9 — navegación:** ruta `/panel` como inicio y menú en el encabezado; pruebas de interfaz.
3. **A9 — interfaz del panel:**
   - tarjetas de resumen;
   - secciones de plantilla (gráfica y tabla), nómina (desglose) y ausencias;
   - pruebas de interfaz y de accesibilidad.

**Operations:**
- push a `main` (CI y despliegue automático en Vercel);
- verificación en producción con datos de prueba;
- Lighthouse Accesibilidad ≥ 90 en el panel;
- capturas de escritorio y móvil en `docs/evidencias/capturas/iteracion-7/`.

## 7. Aprobación
Plan aprobado el 2026-11-22 ("Apruebo, adelante con Construction").

## 8. Decisiones tomadas durante Construction
- **Gráfica:** una sola serie (activos al cierre), con el mes actual resaltado y su valor rotulado. Cada barra muestra mes, activos, altas y bajas al pasar el cursor. La tabla de 12 meses queda visible debajo y sirve también como alternativa accesible.
- **Barras de porcentaje:** el desglose por departamento usa una barra proporcional al % del total sobre un fondo gris. En celular se oculta la barra y queda el número, para que la tabla quepa sin desplazamiento.
- **Revisión visual antes del commit:** con capturas locales se corrigieron la línea inferior de las tablas con encabezado de fila, el tamaño del texto de la gráfica en celular y la redacción "1 de vacaciones".
- **Estilos compartidos:** las clases de las etiquetas de tipo de permiso se movieron a `components/clasesPermiso.ts` para compartirlas entre el expediente y el panel.

## 9. Operations
✅ Desplegado y verificado en producción el 2026-11-22, con capturas de escritorio y móvil (ver `docs/evidencias/iteracion-7-produccion.md`).
