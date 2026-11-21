export type Empleado = {
  id: string
  nombre: string
  apellidos: string
  puesto: string
  departamento: string
  /** ISO 'yyyy-mm-dd' */
  fechaIngreso: string
  salarioInicial: number
  /** ISO 'yyyy-mm-dd'. Obligatoria desde v1.2; puede faltar en registros anteriores. */
  fechaNacimiento?: string
  /** Número de Seguridad Social, 11 dígitos, único. Obligatorio desde v1.2; puede faltar en registros anteriores. */
  nss?: string
  email?: string
  telefono?: string
  /** A8: si existe, es ex empleado (la baja es definitiva). */
  baja?: Baja
}

export type MotivoBaja = 'RENUNCIA' | 'DESPIDO' | 'FIN_CONTRATO' | 'JUBILACION' | 'OTRO'

export type Baja = {
  /** ISO 'yyyy-mm-dd' */
  fecha: string
  motivo: MotivoBaja
  comentario?: string
}

export type DatosEmpleado = Omit<Empleado, 'id' | 'baja'>

export type TipoPermiso = 'CON_GOCE' | 'SIN_GOCE' | 'VACACIONES'

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
