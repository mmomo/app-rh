import { describe, expect, it } from 'vitest'
import { aniversario, diasLaborables, diasVacacionesPorAnios, periodoVacacional, saldoVacaciones } from './vacaciones'
import type { Permiso, TipoPermiso } from './tipos'

describe('días por antigüedad (LFT art. 76)', () => {
  it('reproduce la tabla de la ley', () => {
    const tabla: [number, number][] = [
      [0, 0], [1, 12], [2, 14], [3, 16], [4, 18], [5, 20],
      [6, 22], [10, 22], [11, 24], [15, 24], [16, 26], [20, 26],
      [21, 28], [25, 28], [26, 30], [30, 30], [31, 32], [35, 32],
    ]
    for (const [anios, dias] of tabla) expect(diasVacacionesPorAnios(anios), `${anios} años`).toBe(dias)
  })
})

describe('periodo vacacional', () => {
  it('criterio de aceptación: ingreso 15/03/2020, hoy 20/11/2026 → periodo 15/03/2026–14/03/2027 con 22 días', () => {
    expect(periodoVacacional('2020-03-15', '2026-11-20')).toEqual({
      anios: 6, inicio: '2026-03-15', fin: '2027-03-14', corresponden: 22,
    })
  })

  it('el día del aniversario inicia un periodo nuevo', () => {
    expect(periodoVacacional('2020-03-15', '2026-03-14').corresponden).toBe(20)
    expect(periodoVacacional('2020-03-15', '2026-03-15').corresponden).toBe(22)
  })

  it('con menos de un año no corresponden días', () => {
    expect(periodoVacacional('2026-06-01', '2026-11-20')).toEqual({
      anios: 0, inicio: '2026-06-01', fin: '2027-05-31', corresponden: 0,
    })
  })

  it('un ingreso el 29/02 cumple años el 01/03 en años no bisiestos', () => {
    expect(aniversario('2024-02-29', 1)).toBe('2025-03-01')
    expect(aniversario('2024-02-29', 4)).toBe('2028-02-29')
  })
})

describe('días laborables (lunes a viernes)', () => {
  it('una semana de lunes a domingo son 5 días', () => {
    expect(diasLaborables('2026-11-30', '2026-12-06')).toBe(5)
  })

  it('un fin de semana son 0 días y un solo día hábil es 1', () => {
    expect(diasLaborables('2026-12-05', '2026-12-06')).toBe(0)
    expect(diasLaborables('2026-12-02', '2026-12-02')).toBe(1)
  })

  it('cuatro semanas son 20 días y cruza meses y años', () => {
    expect(diasLaborables('2026-11-30', '2026-12-27')).toBe(20)
    expect(diasLaborables('2026-12-28', '2027-01-03')).toBe(5)
  })
})

describe('saldo de vacaciones (A6)', () => {
  const ana = { id: 'e1', fechaIngreso: '2020-03-15' }
  const permiso = (tipo: TipoPermiso, fechaInicio: string, fechaFin: string, empleadoId = 'e1'): Permiso => ({
    id: `${tipo}-${fechaInicio}`, empleadoId, tipo, fechaInicio, fechaFin,
  })

  it('criterio de aceptación: 22 días; vacaciones del 30/11 al 06/12/2026 → usados 5, restantes 17', () => {
    const permisos = [permiso('VACACIONES', '2026-11-30', '2026-12-06')]
    expect(saldoVacaciones(ana, permisos, '2026-11-20')).toMatchObject({ corresponden: 22, usados: 5, restantes: 17 })
  })

  it('solo cuenta vacaciones del empleado que inician en el periodo vigente', () => {
    const permisos = [
      permiso('VACACIONES', '2026-03-10', '2026-03-20'), // inicia en el periodo anterior
      permiso('VACACIONES', '2027-03-15', '2027-03-19'), // inicia en el periodo siguiente
      permiso('VACACIONES', '2026-07-06', '2026-07-10', 'e2'), // otro empleado
      permiso('CON_GOCE', '2026-08-03', '2026-08-07'), // no es vacación
      permiso('VACACIONES', '2027-03-12', '2027-03-18'), // inicia en el vigente aunque termina en el siguiente
    ]
    expect(saldoVacaciones(ana, permisos, '2026-11-20')).toMatchObject({ usados: 5, restantes: 17 })
  })
})
