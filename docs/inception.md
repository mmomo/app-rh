# Fase 1 — Inception: Sistema de Control de RR. HH.

> Estado: **BORRADOR — pendiente de aprobación**
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
  salarioNuevo: number;    // > salario vigente (R2b, a confirmar)
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
- Persistencia: **pendiente de decisión** (ver §7).

## 6. Plan de Construction (un commit por requerimiento)
1. Scaffolding Vite + React + TS, Vitest, ESLint, estructura de carpetas.
2. A4 — función de antigüedad + pruebas.
3. A1 + R1 — CRUD de empleados con validación de obligatorios.
4. A3 + R2b — aumentos salariales y salario vigente + pruebas.
5. A2 + R2a — permisos con historial + pruebas.
6. R2c — consistencia adicional.
7. A5 — ajustes de interfaz según criterio medible.

**Operations:** configuración y despliegue en Vercel, verificación de criterios de aceptación en producción, README.

## 7. Preguntas abiertas (bloquean la aprobación)
1. **Persistencia:** ¿`localStorage` (solo frontend) o backend con base de datos?
2. **A5 "Interfaz clara":** ¿qué criterio medible se usará?
3. **R2b "Salario válido":** ¿qué regla exacta?
4. **R2c:** ¿qué otra consistencia se requiere?
5. **Campos obligatorios** del empleado: ¿es correcta la lista de §4?
