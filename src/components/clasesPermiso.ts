import type { TipoPermiso } from '../domain/tipos'

/** Clase de etiqueta por tipo de permiso, compartida por el expediente y el panel. */
export const CLASE_TIPO: Record<TipoPermiso, string> = {
  CON_GOCE: 'etiqueta--con-goce',
  SIN_GOCE: 'etiqueta--sin-goce',
  VACACIONES: 'etiqueta--vacaciones',
}
