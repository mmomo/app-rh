# Control de RR. HH.

[![CI](https://github.com/mmomo/app-rh/actions/workflows/ci.yml/badge.svg)](https://github.com/mmomo/app-rh/actions/workflows/ci.yml)

**Producción:** https://app-rh-iota.vercel.app

Aplicación web para administrar la información del personal: empleados (con NSS único y edad mínima de 18 años), permisos con y sin goce de sueldo, vacaciones según la LFT (corresponden, usadas y restantes), aumentos salariales mensuales (con salario vigente automático y respeto al salario mínimo), antigüedad y baja de empleados (el expediente se conserva como ex empleado).

**Stack:** React 19 + Vite 6 + TypeScript, React Router, Vitest + Testing Library + axe-core. Despliegue en Vercel.

## Uso local

```bash
npm install
npm run dev        # servidor de desarrollo
npm test           # pruebas unitarias, de interfaz y de accesibilidad
npm run lint
npm run build      # build de producción en dist/
npm run preview    # sirve el build localmente
```

## Persistencia
La app incluye dos empleados de ejemplo (`src/data/ejemplos.ts`) que se agregan al cargar si faltan; se pueden editar y dar de baja. Los empleados no se eliminan: al darlos de baja quedan como ex empleados de solo consulta.

Los datos se guardan en `localStorage` del navegador (clave `app-rh:datos:v1`). Cada navegador/dispositivo tiene sus propios datos; borrar los datos del sitio los elimina. La persistencia está aislada detrás de la interfaz `Almacenamiento` (`src/data/almacenamiento.ts`) para poder sustituirla por un backend.

## Estructura

```
src/
  domain/      Reglas de negocio puras (validaciones, antigüedad, salario vigente) + pruebas
  data/        Store reactivo y almacenamiento en localStorage
  components/  Campo de formulario accesible, secciones de aumentos y permisos
  pages/       Lista, formulario, detalle y baja de empleado
  test/        Configuración y pruebas de accesibilidad
docs/
  requerimientos.md   Requerimientos con criterios de aceptación (v1.1)
  inception.md        Plan, modelo de datos y decisiones (AI-DLC: Inception)
  inception-iteracion-2.md  Inception de R3–R5
  inception-iteracion-3.md  Inception de A6 y R6 (vacaciones)
  inception-iteracion-5.md  Inception de R7 (límite de 100 años)
  inception-iteracion-6.md  Inception de A8 y R8 (baja de empleados)
  evidencias/         Evidencia de verificación de criterios
  prompts.md          Registro de prompts
```

## Trazabilidad de requerimientos

| Req. | Implementación | Pruebas |
|---|---|---|
| A1, R1 | `pages/ListaEmpleados.tsx`, `pages/FormularioEmpleado.tsx`, `domain/empleado.ts` | `pages/empleados.test.tsx`, `domain/empleado.test.ts` |
| A2, R2a | `components/SeccionPermisos.tsx`, `domain/permiso.ts` | `components/SeccionPermisos.test.tsx`, `domain/permiso.test.ts` |
| A3, R2b | `components/SeccionAumentos.tsx`, `domain/salario.ts` | `components/SeccionAumentos.test.tsx`, `domain/salario.test.ts` |
| A4 | `domain/antiguedad.ts` | `domain/antiguedad.test.ts` |
| R2c | `domain/empleado.ts`, `domain/permiso.ts`, `domain/salario.ts` | pruebas de dominio y `SeccionPermisos.test.tsx` |
| A5 | `components/Campo.tsx`, estilos en `index.css` | `test/accesibilidad.test.tsx`, `docs/evidencias/a5-accesibilidad.md` |
| R3 | `domain/salarioMinimo.ts`, `domain/empleado.ts`, `domain/salario.ts` | `domain/salarioMinimo.test.ts`, pruebas de dominio y `pages/empleados.test.tsx` |
| R4 | `domain/empleado.ts` (`calcularEdad`, `EDAD_MINIMA`) | `domain/empleado.test.ts`, `pages/empleados.test.tsx` |
| R5 | `domain/empleado.ts` (validación de NSS, única entre activos; `exEmpleadoConNss`) | `domain/empleado.test.ts`, `pages/empleados.test.tsx` |
| A6 | `domain/vacaciones.ts`, `components/SeccionVacaciones.tsx`, columna en `pages/ListaEmpleados.tsx` | `domain/vacaciones.test.ts`, `components/SeccionVacaciones.test.tsx` |
| R6 | `domain/permiso.ts` (`validarPermiso`) | `domain/permiso.test.ts`, `components/SeccionPermisos.test.tsx` |
| A7 | `data/ejemplos.ts`, carga en `data/store.ts` | `data/ejemplos.test.ts` (incluye que los ejemplos cumplan R1–R7), `pages/empleados.test.tsx` |
| R7 | `domain/empleado.ts` (`validarEmpleado`, `excesoDeAnios`); avisos en `pages/ListaEmpleados.tsx` y `pages/DetalleEmpleado.tsx` | `domain/empleado.test.ts`, `pages/empleados.test.tsx`, `test/accesibilidad.test.tsx` |
| A8, R8 | `domain/baja.ts`, `store.darDeBaja`, `pages/FormularioBaja.tsx`; filtro en `pages/ListaEmpleados.tsx`; solo consulta en `pages/DetalleEmpleado.tsx` | `domain/baja.test.ts`, `data/store.test.ts`, `pages/empleados.test.tsx`, `test/accesibilidad.test.tsx` |

## Mantenimiento anual
El salario mínimo cambia cada 1 de enero. Actualizar `SALARIO_MINIMO` en `src/domain/salarioMinimo.ts` con el monto diario publicado por CONASAMI en el DOF y ajustar la prueba de `salarioMinimo.test.ts`.

## Integración continua
`.github/workflows/ci.yml` corre en cada push y pull request a `main`: `npm ci`, lint, pruebas y build (Node 22).

## Despliegue
El proyecto de Vercel está conectado al repositorio: cada push a `main` despliega a producción y cada pull request genera un despliegue de vista previa. Vercel detecta Vite automáticamente (`npm run build`, salida `dist/`). `vercel.json` redirige todas las rutas a `index.html` para que funcionen las rutas del cliente al recargar.
