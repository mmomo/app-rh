import type { Estado } from './almacenamiento'

/**
 * Empleados de ejemplo, siempre presentes (A7). Datos ficticios que cumplen todas las reglas:
 * - María: 8 años de servicio, dos aumentos, un permiso con goce y vacaciones del periodo vigente.
 * - Carlos: menos de un año de servicio (aún sin vacaciones), sin aumentos, un permiso sin goce.
 */
export const EJEMPLOS: Estado = {
  empleados: [
    {
      id: 'ejemplo-maria',
      nombre: 'María Fernanda',
      apellidos: 'González Ruiz',
      fechaNacimiento: '1985-07-23',
      nss: '12048512345',
      puesto: 'Gerente de Recursos Humanos',
      departamento: 'Recursos Humanos',
      fechaIngreso: '2018-02-12',
      salarioInicial: 28000,
      email: 'maria.gonzalez@example.com',
      telefono: '55 1234 5678',
    },
    {
      id: 'ejemplo-carlos',
      nombre: 'Carlos Alberto',
      apellidos: 'Méndez Torres',
      fechaNacimiento: '2001-04-10',
      nss: '31190198765',
      puesto: 'Desarrollador de Software',
      departamento: 'Tecnología',
      fechaIngreso: '2026-03-02',
      salarioInicial: 18500,
      email: 'carlos.mendez@example.com',
    },
  ],
  aumentos: [
    { id: 'ejemplo-maria-a1', empleadoId: 'ejemplo-maria', fecha: '2021-03-01', salarioNuevo: 31500, motivo: 'Evaluación anual' },
    { id: 'ejemplo-maria-a2', empleadoId: 'ejemplo-maria', fecha: '2024-03-01', salarioNuevo: 36000, motivo: 'Promoción' },
  ],
  permisos: [
    {
      id: 'ejemplo-maria-p1', empleadoId: 'ejemplo-maria', tipo: 'CON_GOCE',
      fechaInicio: '2025-09-15', fechaFin: '2025-09-16', motivo: 'Trámite médico',
    },
    { id: 'ejemplo-maria-p2', empleadoId: 'ejemplo-maria', tipo: 'VACACIONES', fechaInicio: '2026-07-13', fechaFin: '2026-07-24' },
    {
      id: 'ejemplo-carlos-p1', empleadoId: 'ejemplo-carlos', tipo: 'SIN_GOCE',
      fechaInicio: '2026-03-20', fechaFin: '2026-03-20', motivo: 'Asunto personal',
    },
  ],
}

const IDS_EJEMPLO = new Set(EJEMPLOS.empleados.map((e) => e.id))

export function esEjemplo(empleadoId: string): boolean {
  return IDS_EJEMPLO.has(empleadoId)
}

/**
 * Agrega los empleados de ejemplo que falten, con su historial. Respeta los cambios hechos a los que ya existen
 * y omite un ejemplo si su NSS ya está asignado a otro empleado (R5).
 */
export function agregarEjemplos(estado: Estado, ejemplos: Estado = EJEMPLOS): Estado {
  const faltantes = ejemplos.empleados.filter(
    (ej) => !estado.empleados.some((e) => e.id === ej.id || e.nss === ej.nss),
  )
  if (faltantes.length === 0) return estado
  const ids = new Set(faltantes.map((e) => e.id))
  return {
    empleados: [...estado.empleados, ...faltantes],
    aumentos: [...estado.aumentos, ...ejemplos.aumentos.filter((a) => ids.has(a.empleadoId))],
    permisos: [...estado.permisos, ...ejemplos.permisos.filter((p) => ids.has(p.empleadoId))],
  }
}
