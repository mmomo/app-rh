export type Empleado = {
  id: string
  nombre: string
  apellidos: string
  puesto: string
  departamento: string
  /** ISO 'yyyy-mm-dd' */
  fechaIngreso: string
  salarioInicial: number
  email?: string
  telefono?: string
}

export type DatosEmpleado = Omit<Empleado, 'id'>

export type TipoPermiso = 'CON_GOCE' | 'SIN_GOCE'

export type Permiso = {
  id: string
  empleadoId: string
  tipo: TipoPermiso
  fechaInicio: string
  fechaFin: string
  motivo?: string
}

export type Aumento = {
  id: string
  empleadoId: string
  fecha: string
  salarioNuevo: number
  motivo?: string
}

/** Errores de validación por campo; un campo ausente es válido. */
export type Errores<K extends string> = Partial<Record<K, string>>
