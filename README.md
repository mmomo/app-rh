# Control de RR. HH.

[![CI](https://github.com/mmomo/app-rh/actions/workflows/ci.yml/badge.svg)](https://github.com/mmomo/app-rh/actions/workflows/ci.yml)

**Producción:** https://app-rh-iota.vercel.app

Aplicación web para administrar la información del personal: empleados, permisos con y sin goce de sueldo, aumentos salariales (con salario vigente automático) y antigüedad.

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
Los datos se guardan en `localStorage` del navegador (clave `app-rh:datos:v1`). Cada navegador/dispositivo tiene sus propios datos; borrar los datos del sitio los elimina. La persistencia está aislada detrás de la interfaz `Almacenamiento` (`src/data/almacenamiento.ts`) para poder sustituirla por un backend.

## Estructura

```
src/
  domain/      Reglas de negocio puras (validaciones, antigüedad, salario vigente) + pruebas
  data/        Store reactivo y almacenamiento en localStorage
  components/  Campo de formulario accesible, secciones de aumentos y permisos
  pages/       Lista, formulario y detalle de empleado
  test/        Configuración y pruebas de accesibilidad
docs/
  requerimientos.md   Requerimientos con criterios de aceptación (v1.1)
  inception.md        Plan, modelo de datos y decisiones (AI-DLC: Inception)
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

## Integración continua
`.github/workflows/ci.yml` corre en cada push y pull request a `main`: `npm ci`, lint, pruebas y build (Node 22).

## Despliegue
Vercel detecta Vite automáticamente (`npm run build`, salida `dist/`). `vercel.json` redirige todas las rutas a `index.html` para que funcionen las rutas del cliente al recargar.
