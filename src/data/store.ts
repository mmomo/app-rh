import { useSyncExternalStore } from 'react'
import type { Aumento, DatosEmpleado, Empleado } from '../domain/tipos'
import { almacenamientoLocal, type Almacenamiento, type Estado } from './almacenamiento'

function nuevoId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function crearStore(almacenamiento: Almacenamiento) {
  let estado = almacenamiento.cargar()
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
      estado = almacenamiento.cargar()
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
    /** Elimina al empleado junto con su historial de permisos y aumentos. */
    eliminarEmpleado(id: string) {
      actualizar((e) => ({
        empleados: e.empleados.filter((emp) => emp.id !== id),
        permisos: e.permisos.filter((p) => p.empleadoId !== id),
        aumentos: e.aumentos.filter((a) => a.empleadoId !== id),
      }))
    },
  }
}

export type Store = ReturnType<typeof crearStore>

export const store = crearStore(almacenamientoLocal)

export function useEstado(): Estado {
  return useSyncExternalStore(store.suscribir, store.getEstado)
}
