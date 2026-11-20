import { useSyncExternalStore } from 'react'
import type { Aumento, DatosEmpleado, Empleado, Permiso } from '../domain/tipos'
import { almacenamientoLocal, type Almacenamiento, type Estado } from './almacenamiento'
import { agregarEjemplos, esEjemplo } from './ejemplos'

function nuevoId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

type Opciones = { conEjemplos?: boolean }

export function crearStore(almacenamiento: Almacenamiento, { conEjemplos = false }: Opciones = {}) {
  function cargar(): Estado {
    const guardado = almacenamiento.cargar()
    if (!conEjemplos) return guardado
    const completo = agregarEjemplos(guardado)
    if (completo !== guardado) almacenamiento.guardar(completo)
    return completo
  }

  let estado = cargar()
  const suscriptores = new Set<() => void>()

  function actualizar(cambio: (e: Estado) => Estado) {
    estado = cambio(estado)
    almacenamiento.guardar(estado)
    suscriptores.forEach((s) => s())
  }

  return {
    getEstado: () => estado,
    suscribir(fn: () => void) {
      suscriptores.add(fn)
      return () => suscriptores.delete(fn)
    },
    /** Vuelve a leer el almacenamiento (útil en pruebas). */
    recargar() {
      estado = cargar()
      suscriptores.forEach((s) => s())
    },

    crearEmpleado(datos: DatosEmpleado): Empleado {
      const empleado = { id: nuevoId(), ...datos }
      actualizar((e) => ({ ...e, empleados: [...e.empleados, empleado] }))
      return empleado
    },
    actualizarEmpleado(id: string, datos: DatosEmpleado) {
      actualizar((e) => ({
        ...e,
        empleados: e.empleados.map((emp) => (emp.id === id ? { id, ...datos } : emp)),
      }))
    },
    crearAumento(datos: Omit<Aumento, 'id'>): Aumento {
      const aumento = { id: nuevoId(), ...datos }
      actualizar((e) => ({ ...e, aumentos: [...e.aumentos, aumento] }))
      return aumento
    },
    crearPermiso(datos: Omit<Permiso, 'id'>): Permiso {
      const permiso = { id: nuevoId(), ...datos }
      actualizar((e) => ({ ...e, permisos: [...e.permisos, permiso] }))
      return permiso
    },
    /** Elimina al empleado junto con su historial de permisos y aumentos. Los empleados de ejemplo no se eliminan. */
    eliminarEmpleado(id: string) {
      if (esEjemplo(id)) return
      actualizar((e) => ({
        empleados: e.empleados.filter((emp) => emp.id !== id),
        permisos: e.permisos.filter((p) => p.empleadoId !== id),
        aumentos: e.aumentos.filter((a) => a.empleadoId !== id),
      }))
    },
  }
}

export type Store = ReturnType<typeof crearStore>

// En pruebas se arranca sin ejemplos para que cada caso controle sus datos.
export const store = crearStore(almacenamientoLocal, { conEjemplos: import.meta.env.MODE !== 'test' })

export function useEstado(): Estado {
  return useSyncExternalStore(store.suscribir, store.getEstado)
}
