import { describe, expect, it } from 'vitest'
import { diasPermiso, permisosDe, validarPermiso, type FormPermiso } from './permiso'
import type { Permiso } from './tipos'

const INGRESO = '2020-03-15'
const ana = { id: 'e1', fechaIngreso: INGRESO }
const form: FormPermiso = { tipo: 'CON_GOCE', fechaInicio: '2026-12-05', fechaFin: '2026-12-10', motivo: '' }

describe('validarPermiso (R2a)', () => {
  it('acepta un permiso con fechas en orden', () => {
    expect(validarPermiso(form, ana)).toEqual({})
  })

  it('acepta un permiso de un solo día', () => {
    expect(validarPermiso({ ...form, fechaFin: form.fechaInicio }, ana)).toEqual({})
  })

  it('caso de prueba: inicio 10/12, fin 05/12 → bloqueado', () => {
    expect(validarPermiso({ ...form, fechaInicio: '2026-12-10', fechaFin: '2026-12-05' }, ana)).toEqual({
      fechaFin: 'La fecha de fin no puede ser anterior a la de inicio.',
    })
  })

  it('exige tipo y fechas', () => {
    expect(Object.keys(validarPermiso({ tipo: '', fechaInicio: '', fechaFin: '', motivo: '' }, ana)).sort()).toEqual(
      ['fechaFin', 'fechaInicio', 'tipo'],
    )
  })
})

describe('validarPermiso (R2c)', () => {
  it('caso de prueba: ingreso 15/03/2020, permiso con inicio 01/01/2020 → bloqueado', () => {
    expect(validarPermiso({ ...form, fechaInicio: '2020-01-01', fechaFin: '2020-01-02' }, ana)).toEqual({
      fechaInicio: 'El permiso no puede iniciar antes del ingreso (15/03/2020).',
    })
  })

  it('acepta un permiso que inicia el día del ingreso', () => {
    expect(validarPermiso({ ...form, fechaInicio: INGRESO, fechaFin: INGRESO }, ana)).toEqual({})
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

describe('saldo de vacaciones (R6)', () => {
  const vacaciones = (fechaInicio: string, fechaFin: string): FormPermiso => ({ tipo: 'VACACIONES', fechaInicio, fechaFin, motivo: '' })
  const previas: Permiso[] = [
    { id: 'v1', empleadoId: 'e1', tipo: 'VACACIONES', fechaInicio: '2026-11-30', fechaFin: '2026-12-06' },
  ]

  it('acepta vacaciones dentro del saldo, incluido agotarlo exactamente', () => {
    expect(validarPermiso(vacaciones('2026-11-30', '2026-12-06'), ana, [])).toEqual({})
    // Quedan 17: tres semanas (15) + 2 días = 17
    expect(validarPermiso(vacaciones('2027-01-04', '2027-01-26'), ana, previas)).toEqual({})
  })

  it('caso de prueba: le quedan 17 días; 4 semanas (20 laborables) → bloqueado', () => {
    expect(validarPermiso(vacaciones('2027-01-04', '2027-01-31'), ana, previas)).toEqual({
      fechaFin: 'Son 20 días laborables y le quedan 17 en el periodo vacacional 15/03/2026–14/03/2027.',
    })
  })

  it('caso de prueba: con menos de un año de servicio → bloqueado', () => {
    const nuevo = { id: 'e2', fechaIngreso: '2026-05-20' }
    expect(validarPermiso(vacaciones('2026-11-30', '2026-12-04'), nuevo)).toEqual({
      fechaInicio: 'Aún no tiene derecho a vacaciones en esa fecha: cumple su primer año de servicio el 20/05/2027.',
    })
  })

  it('rechaza un rango sin días laborables', () => {
    expect(validarPermiso(vacaciones('2026-12-05', '2026-12-06'), ana)).toEqual({
      fechaFin: 'El periodo no incluye días laborables (lunes a viernes).',
    })
  })

  it('valida contra el periodo en que inician y no limita otros tipos de permiso', () => {
    // Periodo siguiente (desde 15/03/2027): 22 días nuevos, sin usar
    expect(validarPermiso(vacaciones('2027-03-15', '2027-04-09'), ana, previas)).toEqual({})
    expect(validarPermiso({ ...vacaciones('2027-01-04', '2027-01-31'), tipo: 'CON_GOCE' }, ana, previas)).toEqual({})
  })
})
