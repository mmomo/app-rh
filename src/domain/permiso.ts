import { MENSAJE_OBLIGATORIO } from './empleado'
import { esFechaISOValida } from './fechas'
import type { Errores, Permiso, TipoPermiso } from './tipos'

export const ETIQUETA_TIPO_PERMISO: Record<TipoPermiso, string> = {
  CON_GOCE: 'Con goce de sueldo',
  SIN_GOCE: 'Sin goce de sueldo',
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

/** R2a: la fecha de fin no puede ser anterior a la de inicio. */
export function validarPermiso(form: FormPermiso): Errores<CampoPermiso> {
  const errores: Errores<CampoPermiso> = {}
  if (form.tipo === '') errores.tipo = 'Selecciona el tipo de permiso.'

  for (const campo of ['fechaInicio', 'fechaFin'] as const) {
    if (form[campo] === '') errores[campo] = MENSAJE_OBLIGATORIO
    else if (!esFechaISOValida(form[campo])) errores[campo] = 'Ingresa una fecha válida.'
  }

  if (!errores.fechaInicio && !errores.fechaFin && form.fechaFin < form.fechaInicio) {
    errores.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio.'
  }
  return errores
}
