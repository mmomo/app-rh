import { describe, expect, it } from 'vitest'
import {
  activoEn,
  ausentesEn,
  evolucionPlantilla,
  nombreMes,
  nominaEn,
  nominaPorDepartamento,
  permisosDelMes,
  plantillaDelMes,
  salarioEn,
  sumarMeses,
  ultimoDia,
} from './panel'
import type { Aumento, Empleado, Permiso } from './tipos'

const HOY = '2026-11-22'
const base = { puesto: 'P', nss: '', fechaNacimiento: '1990-01-01' }
const ana: Empleado = { ...base, id: 'ana', nombre: 'Ana', apellidos: 'López', departamento: 'Finanzas', fechaIngreso: '2020-03-15', salarioInicial: 10000 }
const luis: Empleado = { ...base, id: 'luis', nombre: 'Luis', apellidos: 'Pérez', departamento: 'TI', fechaIngreso: '2026-11-03', salarioInicial: 20000 }
const rosa: Empleado = {
  ...base, id: 'rosa', nombre: 'Rosa', apellidos: 'Díaz', departamento: 'TI', fechaIngreso: '2019-02-01', salarioInicial: 15000,
  baja: { fecha: '2026-11-10', motivo: 'RENUNCIA' },
}
const empleados = [ana, luis, rosa]
const aumentos: Aumento[] = [{ id: 'a1', empleadoId: 'ana', fecha: '2025-01-01', salarioNuevo: 11500 }]
const permisos: Permiso[] = [{ id: 'p1', empleadoId: 'ana', tipo: 'CON_GOCE', fechaInicio: '2026-11-20', fechaFin: '2026-11-24' }]

describe('criterio de aceptación (A9)', () => {
  it('plantilla: activos 2, altas 1, bajas 1, variación 0 vs. octubre', () => {
    const noviembre = plantillaDelMes(empleados, '2026-11', HOY)
    const octubre = plantillaDelMes(empleados, '2026-10', HOY)
    expect(noviembre).toEqual({ mes: '2026-11', cierre: HOY, activos: 2, altas: 1, bajas: 1 })
    expect(noviembre.activos - octubre.activos).toBe(0)
  })

  it('nómina $31,500, +$5,000 (+18.9%) vs. el cierre de octubre', () => {
    const actual = nominaEn(empleados, aumentos, HOY)
    const anterior = nominaEn(empleados, aumentos, '2026-10-31')
    expect(actual).toBe(31500)
    expect(actual - anterior).toBe(5000)
    expect(((actual - anterior) / anterior) * 100).toBeCloseTo(18.87, 2)
  })

  it('ausencias: Ana hoy hasta el 24/11/2026 y 1 permiso en el mes', () => {
    expect(ausentesEn(empleados, permisos, HOY).map((a) => [a.empleado.id, a.permiso.fechaFin])).toEqual([['ana', '2026-11-24']])
    expect(permisosDelMes(permisos, empleados, '2026-11')).toMatchObject({
      porTipo: { CON_GOCE: 1, SIN_GOCE: 0, VACACIONES: 0 },
      personas: 1,
    })
  })
})

describe('plantilla', () => {
  it('quien se da de baja deja de estar activo desde la fecha de baja', () => {
    expect(activoEn(rosa, '2026-11-09')).toBe(true)
    expect(activoEn(rosa, '2026-11-10')).toBe(false)
    expect(activoEn(luis, '2026-11-02')).toBe(false)
    expect(activoEn(luis, '2026-11-03')).toBe(true)
  })

  it('una baja el último día del mes cuenta como baja de ese mes y ya no está activo al cierre', () => {
    const pedro = { ...ana, id: 'pedro', baja: { fecha: '2026-10-31', motivo: 'DESPIDO' as const } }
    expect(plantillaDelMes([pedro], '2026-10', HOY)).toMatchObject({ activos: 0, bajas: 1 })
  })

  it('la evolución cubre 12 meses hasta el actual y cruza el cambio de año', () => {
    const evolucion = evolucionPlantilla(empleados, HOY)
    expect(evolucion.map((m) => m.mes)).toEqual([
      '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05',
      '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11',
    ])
    expect(evolucion[0]).toMatchObject({ cierre: '2025-12-31', activos: 2, altas: 0, bajas: 0 })
    expect(evolucion.at(-1)).toMatchObject({ cierre: HOY, activos: 2, altas: 1, bajas: 1 })
  })

  it('fechas de mes', () => {
    expect(sumarMeses('2026-01', -1)).toBe('2025-12')
    expect(sumarMeses('2026-11', 2)).toBe('2027-01')
    expect(ultimoDia('2028-02')).toBe('2028-02-29')
    expect(nombreMes('2026-10')).toBe('octubre')
    expect(nombreMes('2026-10', true)).toBe('octubre 2026')
  })
})

describe('nómina', () => {
  it('usa el salario vigente en cada fecha: un aumento a mitad de mes cuenta desde su fecha', () => {
    const conAumento = [...aumentos, { id: 'a2', empleadoId: 'ana', fecha: '2026-11-15', salarioNuevo: 13000 }]
    expect(salarioEn(ana, conAumento, '2026-11-14')).toBe(11500)
    expect(salarioEn(ana, conAumento, '2026-11-15')).toBe(13000)
    expect(salarioEn(ana, conAumento, '2019-01-01')).toBe(10000)
  })

  it('agrupa por departamento sin distinguir mayúsculas ni espacios, de mayor a menor monto', () => {
    const otro = { ...luis, id: 'otro', departamento: ' ti ', salarioInicial: 10000 }
    expect(nominaPorDepartamento([ana, luis, rosa, otro], aumentos, HOY)).toEqual([
      { departamento: 'TI', monto: 30000, personas: 2, porcentaje: (30000 / 41500) * 100 },
      { departamento: 'Finanzas', monto: 11500, personas: 1, porcentaje: (11500 / 41500) * 100 },
    ])
  })

  it('sin activos la nómina es 0', () => {
    expect(nominaEn([rosa], [], HOY)).toBe(0)
    expect(nominaPorDepartamento([rosa], [], HOY)).toEqual([])
  })
})

describe('ausencias', () => {
  it('un ex empleado no cuenta como ausente; ordena por fecha de regreso', () => {
    const lista: Permiso[] = [
      { id: 'r', empleadoId: 'rosa', tipo: 'SIN_GOCE', fechaInicio: '2026-11-01', fechaFin: '2026-11-30' },
      { id: 'l', empleadoId: 'luis', tipo: 'VACACIONES', fechaInicio: '2026-11-22', fechaFin: '2026-11-22' },
      ...permisos,
    ]
    expect(ausentesEn(empleados, lista, HOY).map((a) => a.empleado.id)).toEqual(['luis', 'ana'])
  })

  it('un permiso que cruza meses cuenta en ambos con los días de cada mes; incluye ex empleados', () => {
    const lista: Permiso[] = [
      { id: 'v', empleadoId: 'ana', tipo: 'VACACIONES', fechaInicio: '2026-11-30', fechaFin: '2026-12-04' },
      { id: 's', empleadoId: 'rosa', tipo: 'SIN_GOCE', fechaInicio: '2026-10-29', fechaFin: '2026-11-02' },
    ]
    const nov = permisosDelMes(lista, empleados, '2026-11')
    expect(nov.permisos.map((p) => [p.permiso.id, p.diasEnMes, p.empleado?.id])).toEqual([
      ['s', 2, 'rosa'],
      ['v', 1, 'ana'],
    ])
    expect(nov.personas).toBe(2)
    expect(permisosDelMes(lista, empleados, '2026-12').permisos.map((p) => p.diasEnMes)).toEqual([4])
    expect(permisosDelMes(lista, empleados, '2026-09').permisos).toEqual([])
  })
})
