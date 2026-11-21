import { describe, expect, it } from 'vitest'
import { antiguedadDe, bajaDesdeForm, esActivo, fechaUltimoMovimiento, validarBaja, type FormBaja } from './baja'
import type { Aumento, Permiso } from './tipos'

const HOY = '2026-11-21'
const ana = { id: 'e1', fechaIngreso: '2020-03-15' }
const formValido: FormBaja = { fecha: '2026-11-20', motivo: 'RENUNCIA', comentario: '' }
const permisos: Permiso[] = [
  { id: 'p1', empleadoId: 'e1', tipo: 'VACACIONES', fechaInicio: '2026-11-30', fechaFin: '2026-12-04' },
  { id: 'p2', empleadoId: 'e2', tipo: 'CON_GOCE', fechaInicio: '2027-01-01', fechaFin: '2027-01-02' },
]
const aumentos: Aumento[] = [{ id: 'a1', empleadoId: 'e1', fecha: '2025-01-01', salarioNuevo: 11500 }]

describe('validarBaja (R8)', () => {
  it('acepta fecha y motivo válidos', () => {
    expect(validarBaja(formValido, ana, [], aumentos, HOY)).toEqual({})
  })

  it('exige fecha y motivo', () => {
    expect(validarBaja({ fecha: '', motivo: '', comentario: '' }, ana, [], [], HOY)).toEqual({
      fecha: 'Este campo es obligatorio.',
      motivo: 'Selecciona el motivo de la baja.',
    })
  })

  it('caso de prueba: ingreso 15/03/2020, baja 01/01/2020 → bloqueado', () => {
    expect(validarBaja({ ...formValido, fecha: '2020-01-01' }, ana, [], [], HOY).fecha).toBe(
      'La baja no puede ser anterior al ingreso (15/03/2020).',
    )
  })

  it('caso de prueba: baja futura → bloqueado; hoy → aceptado', () => {
    expect(validarBaja({ ...formValido, fecha: '2026-11-22' }, ana, [], [], HOY).fecha).toBe('La fecha de baja no puede ser futura.')
    expect(validarBaja({ ...formValido, fecha: HOY }, ana, [], [], HOY)).toEqual({})
  })

  it('caso de prueba: permiso hasta 04/12/2026, baja 21/11/2026 → bloqueado', () => {
    expect(validarBaja({ ...formValido, fecha: HOY }, ana, permisos, aumentos, '2026-12-10').fecha).toBe(
      'Tiene permisos o aumentos registrados hasta el 04/12/2026; la baja no puede ser anterior.',
    )
    expect(validarBaja({ ...formValido, fecha: '2026-12-04' }, ana, permisos, aumentos, '2026-12-10')).toEqual({})
  })

  it('rechaza una baja anterior al último aumento', () => {
    expect(validarBaja({ ...formValido, fecha: '2024-12-31' }, ana, [], aumentos, HOY).fecha).toMatch(/hasta el 01\/01\/2025/)
  })
})

describe('ex empleados (A8)', () => {
  it('la última fecha del historial considera solo al empleado y el fin de los permisos', () => {
    expect(fechaUltimoMovimiento('e1', permisos, aumentos)).toBe('2026-12-04')
    expect(fechaUltimoMovimiento('e3', permisos, aumentos)).toBeUndefined()
  })

  it('la antigüedad se congela en la fecha de baja', () => {
    expect(antiguedadDe(ana, HOY)).toEqual({ anios: 6, meses: 8 })
    expect(antiguedadDe({ ...ana, baja: { fecha: '2023-09-20', motivo: 'DESPIDO' } }, HOY)).toEqual({ anios: 3, meses: 6 })
  })

  it('distingue activos de ex empleados y omite el comentario vacío', () => {
    expect(esActivo({ baja: undefined })).toBe(true)
    expect(esActivo({ baja: bajaDesdeForm(formValido) })).toBe(false)
    expect(bajaDesdeForm({ ...formValido, comentario: ' Cambio de ciudad ' })).toEqual({
      fecha: '2026-11-20', motivo: 'RENUNCIA', comentario: 'Cambio de ciudad',
    })
  })
})
