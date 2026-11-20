# Fase 1 — Inception: Sistema de Control de RR. HH.

> Estado: **APROBADO** (2026-11-19)
> Fecha: 2026-11-19
> Fuente: `docs/requerimientos.md` v1.0

## 1. Objetivo
Una aplicación web (React + Vite + TypeScript, desplegada en Vercel) para registrar empleados y llevar su historial de permisos y aumentos salariales, mostrando salario vigente y antigüedad calculados de forma automática.

## 2. Alcance

**Incluido**
- CRUD de empleados (A1).
- Registro e historial de permisos con/sin goce de sueldo (A2).
- Registro e historial de aumentos salariales con salario vigente derivado (A3).
- Cálculo de antigüedad en años y meses (A4).
- Validaciones de captura (R1, R2a, R2b, R2c).

**Fuera de alcance (v1)** — salvo que se indique lo contrario
- Autenticación / roles de usuario.
- Nómina, cálculo de impuestos, reportes exportables.
- Multi-organización.

## 3. Historias de usuario

| ID | Historia | Req. |
|---|---|---|
| HU1 | Como encargado de RR. HH., quiero dar de alta un empleado para tener su expediente. | A1, R1 |
| HU2 | Quiero ver la lista de empleados y buscar por nombre para encontrarlos rápido. | A1, A5 |
| HU3 | Quiero editar los datos de un empleado para mantenerlos al día. | A1, R1 |
| HU4 | Quiero eliminar un empleado (con confirmación) para depurar el registro. | A1 |
| HU5 | Quiero registrar un permiso con o sin goce de sueldo y verlo en su historial. | A2, R2a |
| HU6 | Quiero registrar un aumento y que el salario vigente se actualice solo. | A3, R2b |
| HU7 | Quiero ver la antigüedad del empleado en su detalle. | A4 |

## 4. Modelo de datos (propuesto)

```ts
type Empleado = {
  id: string;
  nombre: string;          // obligatorio
  apellidos: string;       // obligatorio
  puesto: string;          // obligatorio
  departamento: string;    // obligatorio
  fechaIngreso: string;    // ISO yyyy-mm-dd, obligatorio
  salarioInicial: number;  // obligatorio, > 0
  email?: string;
  telefono?: string;
};

type Permiso = {
  id: string;
  empleadoId: string;
  tipo: 'CON_GOCE' | 'SIN_GOCE';
  fechaInicio: string;
  fechaFin: string;        // >= fechaInicio (R2a)
  motivo?: string;
};

type Aumento = {
  id: string;
  empleadoId: string;
  fecha: string;
  salarioNuevo: number;    // > salario vigente (R2b)
  motivo?: string;
};
```

**Reglas derivadas (no se almacenan):**
- *Salario vigente* = `salarioNuevo` del aumento más reciente; si no hay aumentos, `salarioInicial`. El historial muestra el salario inicial + todos los aumentos (A3).
- *Antigüedad* = diferencia en años y meses completos entre `fechaIngreso` y hoy. Ej.: 15/03/2020 → 19/11/2026 = "6 años 8 meses" (A4).

## 5. Arquitectura (propuesta)
- SPA React + Vite + TS con React Router (rutas: `/empleados`, `/empleados/nuevo`, `/empleados/:id`, `/empleados/:id/editar`).
- Lógica de dominio (validaciones, salario vigente, antigüedad) en funciones puras en `src/domain/`, con pruebas unitarias (Vitest).
- Capa de repositorio (`src/data/`) detrás de una interfaz, para poder cambiar la persistencia sin tocar la UI.
- Persistencia: **`localStorage`** (despliegue estático en Vercel). Los datos viven en el navegador de cada usuario.

## 6. Plan de Construction (un commit por requerimiento) — ✅ completado 2026-11-19
1. Scaffolding Vite + React + TS, Vitest, ESLint, estructura de carpetas.
2. A4 — función de antigüedad + pruebas.
3. A1 + R1 — CRUD de empleados con validación de obligatorios.
4. A3 + R2b — aumentos salariales y salario vigente + pruebas.
5. A2 + R2a — permisos con historial + pruebas.
6. R2c — consistencia adicional.
7. A5 — ajustes de interfaz según criterio medible.

**Operations:** configuración y despliegue en Vercel, verificación de criterios de aceptación en producción, README. — ✅ completado 2026-11-19: https://app-rh-iota.vercel.app (ver `docs/evidencias/operations-produccion.md`).

## 7. Decisiones tomadas (2026-11-19)
| Tema | Decisión |
|---|---|
| Persistencia | `localStorage`, sin backend. |
| A5 Interfaz clara | Lighthouse Accesibilidad ≥ 90 en lista, formulario y detalle; todos los campos con etiqueta. |
| R2b Salario válido | Salario inicial > 0; un aumento debe ser mayor que el salario vigente. |
| R2c Consistencia | Fecha de ingreso no futura; permisos y aumentos no pueden ser anteriores a la fecha de ingreso. |

Los cambios se reflejan en `docs/requerimientos.md` v1.1.

## 8. Aprobación
- Campos obligatorios del empleado (§4) confirmados: nombre, apellidos, puesto, departamento, fecha de ingreso y salario inicial; email y teléfono opcionales.
- Plan de Construction (§6) aprobado el 2026-11-19.

## 9. Decisiones tomadas durante Construction
Detalles no especificados en los requerimientos, resueltos para mantener consistente el historial (pendientes de validar):
- La fecha de un aumento no puede ser futura ni anterior al último aumento registrado; así el "salario vigente" (aumento más reciente) siempre coincide con el último monto capturado.
- Si el empleado ya tiene aumentos, el salario inicial queda en solo lectura al editarlo (cambiarlo podría dejar un aumento menor que el salario anterior, contra R2b).
- Al editar, la fecha de ingreso no puede quedar después del primer permiso o aumento (extensión de R2c).
- Eliminar un empleado borra también sus permisos y aumentos, previa confirmación.
