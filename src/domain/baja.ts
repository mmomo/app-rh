import { calcularAntiguedad, type Antiguedad } from './antiguedad'
import { MENSAJE_OBLIGATORIO } from './empleado'
import { esFechaISOValida, formatearFecha, hoyISO } from './fechas'
import type { Aumento, Baja, Empleado, Errores, MotivoBaja, Permiso } from './tipos'

export const ETIQUETA_MOTIVO_BAJA: Record<MotivoBaja, string> = {
  RENUNCIA: 'Renuncia',
  DESPIDO: 'Despido',
  FIN_CONTRATO: 'Término de contrato',
  JUBILACION: 'Jubilación',
  OTRO: 'Otro',
}

export type FormBaja = { fecha: string; motivo: MotivoBaja | ''; comentario: string }
export type CampoBaja = keyof FormBaja

export function esActivo(e: Pick<Empleado, 'baja'>): boolean {
  return !e.baja
}

/** A4 con A8: la antigüedad de un ex empleado se congela en su fecha de baja. */
export function antiguedadDe(e: Pick<Empleado, 'fechaIngreso' | 'baja'>, hoy: string = hoyISO()): Antiguedad {
  return calcularAntiguedad(e.fechaIngreso, e.baja?.fecha ?? hoy)
}

/** Fecha más reciente del historial: último aumento o fin del último permiso. */
export function fechaUltimoMovimiento(empleadoId: string, permisos: Permiso[], aumentos: Aumento[]): string | undefined {
  const fechas = [
    ...permisos.filter((p) => p.empleadoId === empleadoId).map((p) => p.fechaFin),
    ...aumentos.filter((a) => a.empleadoId === empleadoId).map((a) => a.fecha),
  ]
  return fechas.sort().at(-1)
}

/**
 * R8: fecha y motivo obligatorios; la fecha no puede ser futura, anterior al ingreso,
 * ni anterior al último aumento o al fin del último permiso.
 */
export function validarBaja(
  form: FormBaja,
  empleado: Pick<Empleado, 'id' | 'fechaIngreso'>,
  permisos: Permiso[] = [],
  aumentos: Aumento[] = [],
  hoy: string = hoyISO(),
): Errores<CampoBaja> {
  const errores: Errores<CampoBaja> = {}
  if (form.motivo === '') errores.motivo = 'Selecciona el motivo de la baja.'
  const ultimo = fechaUltimoMovimiento(empleado.id, permisos, aumentos)
  if (form.fecha === '') errores.fecha = MENSAJE_OBLIGATORIO
  else if (!esFechaISOValida(form.fecha)) errores.fecha = 'Ingresa una fecha válida.'
  else if (form.fecha > hoy) errores.fecha = 'La fecha de baja no puede ser futura.'
  else if (form.fecha < empleado.fechaIngreso) {
    errores.fecha = `La baja no puede ser anterior al ingreso (${formatearFecha(empleado.fechaIngreso)}).`
  } else if (ultimo && form.fecha < ultimo) {
    errores.fecha = `Tiene permisos o aumentos registrados hasta el ${formatearFecha(ultimo)}; la baja no puede ser anterior.`
  }
  return errores
}

export function bajaDesdeForm(form: FormBaja): Baja {
  const comentario = form.comentario.trim()
  return { fecha: form.fecha, motivo: form.motivo as MotivoBaja, ...(comentario && { comentario }) }
}
