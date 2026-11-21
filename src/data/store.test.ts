import { describe, expect, it } from 'vitest'
import { crearStore } from './store'
import { estadoVacio, type Almacenamiento, type Estado } from './almacenamiento'

function memoria(inicial: Estado = estadoVacio): Almacenamiento & { guardado: Estado } {
  return {
    guardado: inicial,
    cargar() {
      return this.guardado
    },
    guardar(e) {
      this.guardado = e
    },
  }
}

const datos = {
  nombre: 'Ana',
  apellidos: 'López',
  puesto: 'Analista',
  departamento: 'Finanzas',
  fechaIngreso: '2020-03-15',
  salarioInicial: 10000,
}

describe('store de empleados (A1)', () => {
  it('crea y edita, persistiendo cada cambio', () => {
    const alm = memoria()
    const s = crearStore(alm)

    const ana = s.crearEmpleado(datos)
    expect(alm.guardado.empleados).toEqual([ana])

    s.actualizarEmpleado(ana.id, { ...datos, puesto: 'Gerente' })
    expect(alm.guardado.empleados[0].puesto).toBe('Gerente')
  })

  it('da de baja conservando el registro y su historial (A8); editar no quita la baja', () => {
    const alm = memoria({
      empleados: [{ id: 'e1', ...datos }],
      permisos: [{ id: 'p1', empleadoId: 'e1', tipo: 'CON_GOCE', fechaInicio: '2024-01-01', fechaFin: '2024-01-02' }],
      aumentos: [{ id: 'a1', empleadoId: 'e1', fecha: '2024-01-01', salarioNuevo: 11000 }],
    })
    const s = crearStore(alm)
    const baja = { fecha: '2026-11-20', motivo: 'RENUNCIA' as const }
    s.darDeBaja('e1', baja)
    expect(alm.guardado.empleados).toEqual([{ id: 'e1', ...datos, baja }])
    expect(alm.guardado.permisos).toHaveLength(1)
    expect(alm.guardado.aumentos).toHaveLength(1)
    s.actualizarEmpleado('e1', { ...datos, puesto: 'Gerente' })
    expect(alm.guardado.empleados[0].baja).toEqual(baja)
  })

  it('notifica a los suscriptores', () => {
    const s = crearStore(memoria())
    let llamadas = 0
    s.suscribir(() => llamadas++)
    s.crearEmpleado(datos)
    expect(llamadas).toBe(1)
  })
})
