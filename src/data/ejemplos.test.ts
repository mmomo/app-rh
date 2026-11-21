import { describe, expect, it } from 'vitest'
import { formDesdeEmpleado, validarEmpleado } from '../domain/empleado'
import { validarPermiso } from '../domain/permiso'
import { aumentosDe, validarAumento } from '../domain/salario'
import { saldoVacaciones } from '../domain/vacaciones'
import { estadoVacio, type Almacenamiento, type Estado } from './almacenamiento'
import { agregarEjemplos, EJEMPLOS, esEjemplo } from './ejemplos'
import { crearStore } from './store'

const HOY = '2026-11-20'
const [maria, carlos] = EJEMPLOS.empleados

describe('empleados de ejemplo (A7)', () => {
  it('cada empleado cumple R1, R3, R4, R5, R7 y R2c', () => {
    for (const e of EJEMPLOS.empleados) {
      expect(validarEmpleado(formDesdeEmpleado(e), { hoy: HOY, empleados: EJEMPLOS.empleados, idActual: e.id }), e.id).toEqual({})
    }
  })

  it('los aumentos cumplen R2b, R2c y R3 en orden cronológico', () => {
    for (const e of EJEMPLOS.empleados) {
      const previos: typeof EJEMPLOS.aumentos = []
      for (const a of aumentosDe(e.id, EJEMPLOS.aumentos)) {
        const form = { fecha: a.fecha, salarioNuevo: String(a.salarioNuevo), motivo: a.motivo ?? '' }
        expect(validarAumento(form, e, previos, HOY), a.id).toEqual({})
        previos.push(a)
      }
    }
  })

  it('los permisos cumplen R2a, R2c y R6', () => {
    for (const e of EJEMPLOS.empleados) {
      const previos: typeof EJEMPLOS.permisos = []
      for (const p of EJEMPLOS.permisos.filter((x) => x.empleadoId === e.id)) {
        const form = { tipo: p.tipo, fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, motivo: p.motivo ?? '' }
        expect(validarPermiso(form, e, previos), p.id).toEqual({})
        previos.push(p)
      }
    }
  })

  it('muestran casos distintos: María con vacaciones usadas, Carlos aún sin derecho', () => {
    expect(saldoVacaciones(maria, EJEMPLOS.permisos, HOY)).toMatchObject({ corresponden: 22, usados: 10, restantes: 12 })
    expect(saldoVacaciones(carlos, EJEMPLOS.permisos, HOY).corresponden).toBe(0)
  })
})

describe('agregarEjemplos', () => {
  const otro = {
    id: 'x', nombre: 'Luis', apellidos: 'Pérez', puesto: 'Dev', departamento: 'TI',
    fechaIngreso: '2021-01-01', salarioInicial: 12000, nss: '99999999999', fechaNacimiento: '1990-01-01',
  }

  it('agrega ambos ejemplos con su historial a un estado vacío o con otros empleados', () => {
    expect(agregarEjemplos(estadoVacio)).toEqual(EJEMPLOS)
    const conOtro = agregarEjemplos({ ...estadoVacio, empleados: [otro] })
    expect(conOtro.empleados.map((e) => e.id)).toEqual(['x', 'ejemplo-maria', 'ejemplo-carlos'])
  })

  it('respeta los cambios hechos a un ejemplo y no lo duplica', () => {
    const editado = { ...EJEMPLOS, empleados: [{ ...maria, puesto: 'Directora' }, carlos] }
    expect(agregarEjemplos(editado)).toBe(editado)
  })

  it('vuelve a agregar un ejemplo faltante con su historial', () => {
    const sinCarlos: Estado = {
      empleados: [maria],
      aumentos: EJEMPLOS.aumentos,
      permisos: EJEMPLOS.permisos.filter((p) => p.empleadoId !== carlos.id),
    }
    expect(agregarEjemplos(sinCarlos).permisos.filter((p) => p.empleadoId === carlos.id)).toHaveLength(1)
  })

  it('omite un ejemplo si su NSS ya está asignado (R5)', () => {
    const resultado = agregarEjemplos({ ...estadoVacio, empleados: [{ ...otro, nss: maria.nss }] })
    expect(resultado.empleados.map((e) => e.id)).toEqual(['x', 'ejemplo-carlos'])
  })
})

describe('store con ejemplos', () => {
  function memoria(inicial: Estado = estadoVacio): Almacenamiento & { guardado: Estado } {
    return { guardado: inicial, cargar() { return this.guardado }, guardar(e) { this.guardado = e } }
  }

  it('los carga y persiste al iniciar', () => {
    const alm = memoria()
    crearStore(alm, { conEjemplos: true })
    expect(alm.guardado.empleados).toHaveLength(2)
    expect(esEjemplo('ejemplo-maria')).toBe(true)
  })

  it('un ejemplo dado de baja se conserva como ex empleado y no se vuelve a agregar (A8)', () => {
    const alm = memoria()
    crearStore(alm, { conEjemplos: true }).darDeBaja('ejemplo-carlos', { fecha: '2026-11-20', motivo: 'RENUNCIA' })
    const s = crearStore(alm, { conEjemplos: true })
    expect(s.getEstado().empleados.map((e) => [e.id, e.baja?.motivo])).toEqual([
      ['ejemplo-maria', undefined],
      ['ejemplo-carlos', 'RENUNCIA'],
    ])
  })
})
