// Las fechas se manejan como cadenas ISO 'yyyy-mm-dd' en hora local,
// para evitar desfases por zona horaria al usar objetos Date.

export function hoyISO(ahora: Date = new Date()): string {
  const y = ahora.getFullYear()
  const m = String(ahora.getMonth() + 1).padStart(2, '0')
  const d = String(ahora.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function esFechaISOValida(valor: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  const fecha = new Date(y, m - 1, d)
  return fecha.getFullYear() === y && fecha.getMonth() === m - 1 && fecha.getDate() === d
}

/** Formatea 'yyyy-mm-dd' como 'dd/mm/yyyy'. */
export function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
