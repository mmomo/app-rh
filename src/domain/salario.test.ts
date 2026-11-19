import { describe, expect, it } from 'vitest'
import { historialSalarial, salarioVigente, validarAumento } from './salario'
import type { Aumento, Empleado } from './tipos'

const ana: Empleado = {
  id: 'e1',
  nombre: 'Ana',
  apellidos: 'López',
  puesto: 'Analista',
  departamento: 'Finanzas',
  fechaIngreso: '2020-03-15',
  salarioInicial: 10000,
}
const aumento = (fecha: string, salarioNuevo: number, empleadoId = 'e1'): Aumento => ({
  id: `${empleadoId}-${fecha}`, empleadoId, fecha, salarioNuevo,
})
const HOY = '2026-11-19'

describe('salario vigente (A3)', () => {
  it('sin aumentos, el vigente es el inicial', () => {
    expect(salarioVigente(ana, [])).toBe(10000)
  })

  it('criterio de aceptación: $10,000 + aumento a $11,500 → vigente $11,500 e historial con ambos', () => {
    const aumentos = [aumento('2026-01-01', 11500)]
    expect(salarioVigente(ana, aumentos)).toBe(11500)
    expect(historialSalarial(ana, aumentos).map((m) => m.salario)).toEqual([10000, 11500])
  })

  it('toma el aumento más reciente por fecha e ignora los de otros empleados', () => {
    const aumentos = [aumento('2025-01-01', 13000), aumento('2023-01-01', 12000), aumento('2026-01-01', 99000, 'e2')]
    expect(salarioVigente(ana, aumentos)).toBe(13000)
    expect(historialSalarial(ana, aumentos).map((m) => m.fecha)).toEqual(['2020-03-15', '2023-01-01', '2025-01-01'])
  })
})

describe('validarAumento (R2b)', () => {
  const form = { fecha: '2026-01-01', salarioNuevo: '11500', motivo: '' }

  it('acepta un aumento mayor al vigente', () => {
    expect(validarAumento(form, ana, [], HOY)).toEqual({})
  })

  it('caso de prueba: vigente $10,000, aumento a $9,500 → bloqueado', () => {
    expect(validarAumento({ ...form, salarioNuevo: '9500' }, ana, [], HOY).salarioNuevo).toMatch(/mayor al vigente/)
  })

  it('rechaza un monto igual al vigente', () => {
    expect(validarAumento({ ...form, salarioNuevo: '10000' }, ana, [], HOY).salarioNuevo).toBeDefined()
  })

  it('rechaza montos ≤ 0 y vacíos', () => {
    expect(validarAumento({ ...form, salarioNuevo: '0' }, ana, [], HOY).salarioNuevo).toBe('El salario debe ser mayor a $0.')
    expect(validarAumento({ ...form, salarioNuevo: '' }, ana, [], HOY).salarioNuevo).toBe('Este campo es obligatorio.')
  })

  it('compara contra el vigente tras aumentos previos', () => {
    const previos = [aumento('2025-01-01', 12000)]
    expect(validarAumento({ ...form, salarioNuevo: '11500' }, ana, previos, HOY).salarioNuevo).toBeDefined()
  })

  it('R2c: rechaza un aumento anterior a la fecha de ingreso', () => {
    expect(validarAumento({ ...form, fecha: '2020-03-14' }, ana, [], HOY).fecha).toMatch(/anterior al ingreso/)
  })

  it('rechaza fechas futuras o anteriores al último aumento', () => {
    expect(validarAumento({ ...form, fecha: '2026-12-01' }, ana, [], HOY).fecha).toBeDefined()
    const previos = [aumento('2026-06-01', 11000)]
    expect(validarAumento({ ...form, salarioNuevo: '12000' }, ana, previos, HOY).fecha).toMatch(/último aumento/)
  })
})
