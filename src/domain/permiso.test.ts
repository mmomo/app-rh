import { describe, expect, it } from 'vitest'
import { diasPermiso, permisosDe, validarPermiso, type FormPermiso } from './permiso'
import type { Permiso } from './tipos'

const INGRESO = '2020-03-15'
const form: FormPermiso = { tipo: 'CON_GOCE', fechaInicio: '2026-12-05', fechaFin: '2026-12-10', motivo: '' }

describe('validarPermiso (R2a)', () => {
  it('acepta un permiso con fechas en orden', () => {
    expect(validarPermiso(form, INGRESO)).toEqual({})
  })

  it('acepta un permiso de un solo día', () => {
    expect(validarPermiso({ ...form, fechaFin: form.fechaInicio }, INGRESO)).toEqual({})
  })

  it('caso de prueba: inicio 10/12, fin 05/12 → bloqueado', () => {
    expect(validarPermiso({ ...form, fechaInicio: '2026-12-10', fechaFin: '2026-12-05' }, INGRESO)).toEqual({
      fechaFin: 'La fecha de fin no puede ser anterior a la de inicio.',
    })
  })

  it('exige tipo y fechas', () => {
    expect(Object.keys(validarPermiso({ tipo: '', fechaInicio: '', fechaFin: '', motivo: '' }, INGRESO)).sort()).toEqual(
      ['fechaFin', 'fechaInicio', 'tipo'],
    )
  })
})

describe('validarPermiso (R2c)', () => {
  it('caso de prueba: ingreso 15/03/2020, permiso con inicio 01/01/2020 → bloqueado', () => {
    expect(validarPermiso({ ...form, fechaInicio: '2020-01-01', fechaFin: '2020-01-02' }, INGRESO)).toEqual({
      fechaInicio: 'El permiso no puede iniciar antes del ingreso (15/03/2020).',
    })
  })

  it('acepta un permiso que inicia el día del ingreso', () => {
    expect(validarPermiso({ ...form, fechaInicio: INGRESO, fechaFin: INGRESO }, INGRESO)).toEqual({})
  })
})

describe('permisos (A2)', () => {
  const p = (id: string, empleadoId: string, fechaInicio: string): Permiso => ({
    id, empleadoId, tipo: 'SIN_GOCE', fechaInicio, fechaFin: fechaInicio,
  })

  it('filtra por empleado y ordena del más reciente al más antiguo', () => {
    const lista = [p('1', 'e1', '2024-01-01'), p('2', 'e2', '2025-01-01'), p('3', 'e1', '2026-01-01')]
    expect(permisosDe('e1', lista).map((x) => x.id)).toEqual(['3', '1'])
  })

  it('cuenta los días naturales incluyendo inicio y fin', () => {
    expect(diasPermiso({ fechaInicio: '2026-12-05', fechaFin: '2026-12-10' })).toBe(6)
    expect(diasPermiso({ fechaInicio: '2026-03-28', fechaFin: '2026-03-30' })).toBe(3)
  })
})
