import { describe, expect, it } from 'vitest'
import { calcularAntiguedad, formatearAntiguedad } from './antiguedad'

const texto = (ingreso: string, hoy: string) => formatearAntiguedad(calcularAntiguedad(ingreso, hoy))

describe('antigüedad (A4)', () => {
  it('criterio de aceptación: ingreso 15/03/2020, hoy 19/11/2026 → "6 años 8 meses"', () => {
    expect(texto('2020-03-15', '2026-11-19')).toBe('6 años 8 meses')
  })

  it('no cuenta el mes si aún no se cumple el día', () => {
    expect(calcularAntiguedad('2020-03-20', '2026-11-19')).toEqual({ anios: 6, meses: 7 })
  })

  it('cuenta el mes el mismo día del aniversario mensual', () => {
    expect(calcularAntiguedad('2025-11-19', '2026-11-19')).toEqual({ anios: 1, meses: 0 })
  })

  it('usa singular y omite partes en cero', () => {
    expect(texto('2025-10-01', '2026-11-19')).toBe('1 año 1 mes')
    expect(texto('2024-11-01', '2026-11-19')).toBe('2 años')
    expect(texto('2026-08-01', '2026-11-19')).toBe('3 meses')
  })

  it('muestra "0 meses" para ingresos recientes', () => {
    expect(texto('2026-11-10', '2026-11-19')).toBe('0 meses')
  })
})
