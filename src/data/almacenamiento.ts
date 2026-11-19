import type { Aumento, Empleado, Permiso } from '../domain/tipos'

export type Estado = {
  empleados: Empleado[]
  permisos: Permiso[]
  aumentos: Aumento[]
}

export const estadoVacio: Estado = { empleados: [], permisos: [], aumentos: [] }

/** Persistencia del estado completo; se puede sustituir sin tocar la UI. */
export interface Almacenamiento {
  cargar(): Estado
  guardar(estado: Estado): void
}

const CLAVE = 'app-rh:datos:v1'

export const almacenamientoLocal: Almacenamiento = {
  cargar() {
    try {
      const crudo = localStorage.getItem(CLAVE)
      return crudo ? { ...estadoVacio, ...(JSON.parse(crudo) as Partial<Estado>) } : estadoVacio
    } catch {
      return estadoVacio
    }
  },
  guardar(estado) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      // Sin acceso a localStorage (modo privado, cuota llena): los datos quedan solo en memoria.
    }
  },
}
