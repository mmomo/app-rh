import { hoyISO } from './fechas'

export type Antiguedad = { anios: number; meses: number }

/** Años y meses completos transcurridos desde la fecha de ingreso hasta `hasta` (A4). */
export function calcularAntiguedad(fechaIngreso: string, hasta: string = hoyISO()): Antiguedad {
  const [y1, m1, d1] = fechaIngreso.split('-').map(Number)
  const [y2, m2, d2] = hasta.split('-').map(Number)
  let totalMeses = (y2 - y1) * 12 + (m2 - m1)
  if (d2 < d1) totalMeses--
  totalMeses = Math.max(0, totalMeses)
  return { anios: Math.floor(totalMeses / 12), meses: totalMeses % 12 }
}

export function formatearAntiguedad({ anios, meses }: Antiguedad): string {
  const partes: string[] = []
  if (anios > 0) partes.push(`${anios} ${anios === 1 ? 'año' : 'años'}`)
  if (meses > 0 || anios === 0) partes.push(`${meses} ${meses === 1 ? 'mes' : 'meses'}`)
  return partes.join(' ')
}
