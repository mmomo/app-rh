import { calcularAntiguedad } from './antiguedad'
import { hoyISO } from './fechas'
import type { Empleado, Permiso } from './tipos'

/**
 * A6: días de vacaciones por años de servicio cumplidos (LFT art. 76, reforma DOF 27/12/2022).
 * 12 días al primer año, +2 por año hasta el quinto (20) y, a partir del sexto, +2 por cada 5 años.
 */
export function diasVacacionesPorAnios(anios: number): number {
  if (anios < 1) return 0
  if (anios <= 5) return 10 + 2 * anios
  return 20 + 2 * Math.ceil((anios - 5) / 5)
}

/** Fecha en que se cumplen `n` años desde `fechaIngreso`; un 29/02 se cumple el 01/03 en años no bisiestos. */
export function aniversario(fechaIngreso: string, n: number): string {
  const [y, m, d] = fechaIngreso.split('-').map(Number)
  return hoyISO(new Date(y + n, m - 1, d))
}

function diaAnterior(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return hoyISO(new Date(y, m - 1, d - 1))
}

export type PeriodoVacacional = {
  /** Años de servicio cumplidos al inicio del periodo. */
  anios: number
  inicio: string
  fin: string
  corresponden: number
}

/** Periodo vacacional que contiene `fecha`: del último aniversario de ingreso al día previo al siguiente. */
export function periodoVacacional(fechaIngreso: string, fecha: string = hoyISO()): PeriodoVacacional {
  const anios = calcularAntiguedad(fechaIngreso, fecha).anios
  return {
    anios,
    inicio: aniversario(fechaIngreso, anios),
    fin: diaAnterior(aniversario(fechaIngreso, anios + 1)),
    corresponden: diasVacacionesPorAnios(anios),
  }
}

/** Días laborables (lunes a viernes) entre dos fechas, ambas incluidas. No descuenta festivos. */
export function diasLaborables(inicio: string, fin: string): number {
  const [y, m, d] = inicio.split('-').map(Number)
  const dia = new Date(Date.UTC(y, m - 1, d))
  let total = 0
  while (dia.toISOString().slice(0, 10) <= fin) {
    const semana = dia.getUTCDay()
    if (semana !== 0 && semana !== 6) total++
    dia.setUTCDate(dia.getUTCDate() + 1)
  }
  return total
}

export type SaldoVacaciones = PeriodoVacacional & { usados: number; restantes: number }

/** A6: días que corresponden, usados y restantes en el periodo vacacional que contiene `fecha`. */
export function saldoVacaciones(
  empleado: Pick<Empleado, 'id' | 'fechaIngreso'>,
  permisos: Permiso[],
  fecha: string = hoyISO(),
): SaldoVacaciones {
  const periodo = periodoVacacional(empleado.fechaIngreso, fecha)
  const usados = permisos
    .filter(
      (p) =>
        p.empleadoId === empleado.id &&
        p.tipo === 'VACACIONES' &&
        p.fechaInicio >= periodo.inicio &&
        p.fechaInicio <= periodo.fin,
    )
    .reduce((suma, p) => suma + diasLaborables(p.fechaInicio, p.fechaFin), 0)
  return { ...periodo, usados, restantes: periodo.corresponden - usados }
}
