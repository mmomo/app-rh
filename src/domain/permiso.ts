import { MENSAJE_OBLIGATORIO } from './empleado'
import { esFechaISOValida, formatearFecha } from './fechas'
import type { Empleado, Errores, Permiso, TipoPermiso } from './tipos'
import { aniversario, diasLaborables, saldoVacaciones } from './vacaciones'

export const ETIQUETA_TIPO_PERMISO: Record<TipoPermiso, string> = {
  CON_GOCE: 'Con goce de sueldo',
  SIN_GOCE: 'Sin goce de sueldo',
  VACACIONES: 'Vacaciones',
}

export type FormPermiso = { tipo: TipoPermiso | ''; fechaInicio: string; fechaFin: string; motivo: string }
export type CampoPermiso = keyof FormPermiso

/** A2: permisos del empleado, del más reciente al más antiguo. */
export function permisosDe(empleadoId: string, permisos: Permiso[]): Permiso[] {
  return permisos
    .filter((p) => p.empleadoId === empleadoId)
    .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))
}

/** Días naturales del permiso, contando inicio y fin. */
export function diasPermiso({ fechaInicio, fechaFin }: Pick<Permiso, 'fechaInicio' | 'fechaFin'>): number {
  const utc = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((utc(fechaFin) - utc(fechaInicio)) / 86_400_000) + 1
}

/**
 * R2a: la fecha de fin no puede ser anterior a la de inicio.
 * R2c: el permiso no puede iniciar antes del ingreso.
 * R6: las vacaciones no pueden exceder el saldo del periodo vacacional en que inician.
 */
export function validarPermiso(
  form: FormPermiso,
  empleado: Pick<Empleado, 'id' | 'fechaIngreso'>,
  permisos: Permiso[] = [],
): Errores<CampoPermiso> {
  const { fechaIngreso } = empleado
  const errores: Errores<CampoPermiso> = {}
  if (form.tipo === '') errores.tipo = 'Selecciona el tipo de permiso.'

  for (const campo of ['fechaInicio', 'fechaFin'] as const) {
    if (form[campo] === '') errores[campo] = MENSAJE_OBLIGATORIO
    else if (!esFechaISOValida(form[campo])) errores[campo] = 'Ingresa una fecha válida.'
  }

  if (!errores.fechaInicio && form.fechaInicio < fechaIngreso) {
    errores.fechaInicio = `El permiso no puede iniciar antes del ingreso (${formatearFecha(fechaIngreso)}).`
  }
  if (!errores.fechaInicio && !errores.fechaFin && form.fechaFin < form.fechaInicio) {
    errores.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio.'
  }
  if (form.tipo === 'VACACIONES' && !errores.fechaInicio && !errores.fechaFin) {
    const laborables = diasLaborables(form.fechaInicio, form.fechaFin)
    const saldo = saldoVacaciones(empleado, permisos, form.fechaInicio)
    if (saldo.corresponden === 0) {
      errores.fechaInicio = `Aún no tiene derecho a vacaciones en esa fecha: cumple su primer año de servicio el ${formatearFecha(aniversario(fechaIngreso, 1))}.`
    } else if (laborables === 0) {
      errores.fechaFin = 'El periodo no incluye días laborables (lunes a viernes).'
    } else if (laborables > saldo.restantes) {
      errores.fechaFin = `Son ${laborables} días laborables y le quedan ${saldo.restantes} en el periodo vacacional ${formatearFecha(saldo.inicio)}–${formatearFecha(saldo.fin)}.`
    }
  }
  return errores
}
