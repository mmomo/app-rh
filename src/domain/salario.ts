import { esFechaISOValida, formatearFecha, hoyISO } from './fechas'
import { formatearMoneda } from './formato'
import type { Aumento, Empleado, Errores } from './tipos'
import { MENSAJE_OBLIGATORIO } from './empleado'

export type MovimientoSalarial = {
  id: string
  fecha: string
  salario: number
  concepto: string
}

/** Aumentos del empleado en orden cronológico (estable para la misma fecha). */
export function aumentosDe(empleadoId: string, aumentos: Aumento[]): Aumento[] {
  return aumentos.filter((a) => a.empleadoId === empleadoId).sort((a, b) => a.fecha.localeCompare(b.fecha))
}

/** A3: salario inicial seguido de cada aumento, en orden cronológico. */
export function historialSalarial(empleado: Empleado, aumentos: Aumento[]): MovimientoSalarial[] {
  return [
    { id: 'inicial', fecha: empleado.fechaIngreso, salario: empleado.salarioInicial, concepto: 'Salario inicial' },
    ...aumentosDe(empleado.id, aumentos).map((a) => ({
      id: a.id,
      fecha: a.fecha,
      salario: a.salarioNuevo,
      concepto: a.motivo ? `Aumento: ${a.motivo}` : 'Aumento',
    })),
  ]
}

/** A3: el salario vigente es el del aumento más reciente o, si no hay, el inicial. */
export function salarioVigente(empleado: Empleado, aumentos: Aumento[]): number {
  return historialSalarial(empleado, aumentos).at(-1)!.salario
}

export type FormAumento = { fecha: string; salarioNuevo: string; motivo: string }
export type CampoAumento = keyof FormAumento

/** R2b: el monto debe ser mayor a cero y mayor al salario vigente. R2c: la fecha no puede ser anterior al ingreso. */
export function validarAumento(
  form: FormAumento,
  empleado: Empleado,
  aumentos: Aumento[],
  hoy: string = hoyISO(),
): Errores<CampoAumento> {
  const errores: Errores<CampoAumento> = {}
  const ultimo = aumentosDe(empleado.id, aumentos).at(-1)
  const vigente = salarioVigente(empleado, aumentos)

  if (form.fecha === '') errores.fecha = MENSAJE_OBLIGATORIO
  else if (!esFechaISOValida(form.fecha)) errores.fecha = 'Ingresa una fecha válida.'
  else if (form.fecha > hoy) errores.fecha = 'La fecha no puede ser futura.'
  else if (form.fecha < empleado.fechaIngreso)
    errores.fecha = `La fecha no puede ser anterior al ingreso (${formatearFecha(empleado.fechaIngreso)}).`
  else if (ultimo && form.fecha < ultimo.fecha)
    errores.fecha = `La fecha no puede ser anterior al último aumento (${formatearFecha(ultimo.fecha)}).`

  const monto = Number(form.salarioNuevo)
  if (form.salarioNuevo.trim() === '') errores.salarioNuevo = MENSAJE_OBLIGATORIO
  else if (!Number.isFinite(monto)) errores.salarioNuevo = 'Ingresa un monto numérico.'
  else if (monto <= 0) errores.salarioNuevo = 'El salario debe ser mayor a $0.'
  else if (monto <= vigente)
    errores.salarioNuevo = `El nuevo salario debe ser mayor al vigente (${formatearMoneda(vigente)}).`

  return errores
}
