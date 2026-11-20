import { describe, expect, it } from 'vitest'
import { cumpleSalarioMinimo, SALARIO_MINIMO_MENSUAL } from './salarioMinimo'

describe('salario mínimo (R3)', () => {
  it('el mínimo general mensual 2026 es $315.04 × 365/12 = $9,582.47', () => {
    expect(SALARIO_MINIMO_MENSUAL).toBe(9582.47)
  })

  it('acepta el mínimo exacto y rechaza montos menores', () => {
    expect(cumpleSalarioMinimo(9582.47)).toBe(true)
    expect(cumpleSalarioMinimo(9582.46)).toBe(false)
    expect(cumpleSalarioMinimo(9000)).toBe(false)
  })
})
