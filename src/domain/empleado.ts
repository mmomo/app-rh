import { esFechaISOValida } from './fechas'
import type { DatosEmpleado, Empleado, Errores } from './tipos'

/** Valores del formulario de empleado tal como se capturan (texto). */
export type FormEmpleado = {
  nombre: string
  apellidos: string
  puesto: string
  departamento: string
  fechaIngreso: string
  salarioInicial: string
  email: string
  telefono: string
}

export type CampoEmpleado = keyof FormEmpleado

export const MENSAJE_OBLIGATORIO = 'Este campo es obligatorio.'

const OBLIGATORIOS: CampoEmpleado[] = [
  'nombre',
  'apellidos',
  'puesto',
  'departamento',
  'fechaIngreso',
  'salarioInicial',
]

export const formVacio: FormEmpleado = {
  nombre: '',
  apellidos: '',
  puesto: '',
  departamento: '',
  fechaIngreso: '',
  salarioInicial: '',
  email: '',
  telefono: '',
}

export function formDesdeEmpleado(e: Empleado): FormEmpleado {
  return {
    nombre: e.nombre,
    apellidos: e.apellidos,
    puesto: e.puesto,
    departamento: e.departamento,
    fechaIngreso: e.fechaIngreso,
    salarioInicial: String(e.salarioInicial),
    email: e.email ?? '',
    telefono: e.telefono ?? '',
  }
}

/** R1: los campos obligatorios no pueden quedar vacíos. R2b: el salario inicial debe ser mayor a 0. */
export function validarEmpleado(form: FormEmpleado): Errores<CampoEmpleado> {
  const errores: Errores<CampoEmpleado> = {}
  for (const campo of OBLIGATORIOS) {
    if (form[campo].trim() === '') errores[campo] = MENSAJE_OBLIGATORIO
  }
  if (!errores.fechaIngreso && !esFechaISOValida(form.fechaIngreso)) {
    errores.fechaIngreso = 'Ingresa una fecha válida.'
  }
  if (!errores.salarioInicial) {
    const salario = Number(form.salarioInicial)
    if (!Number.isFinite(salario)) errores.salarioInicial = 'Ingresa un monto numérico.'
    else if (salario <= 0) errores.salarioInicial = 'El salario debe ser mayor a $0.'
  }
  return errores
}

export function datosDesdeForm(form: FormEmpleado): DatosEmpleado {
  const email = form.email.trim()
  const telefono = form.telefono.trim()
  return {
    nombre: form.nombre.trim(),
    apellidos: form.apellidos.trim(),
    puesto: form.puesto.trim(),
    departamento: form.departamento.trim(),
    fechaIngreso: form.fechaIngreso,
    salarioInicial: Number(form.salarioInicial),
    ...(email && { email }),
    ...(telefono && { telefono }),
  }
}

export function nombreCompleto(e: Pick<Empleado, 'nombre' | 'apellidos'>): string {
  return `${e.nombre} ${e.apellidos}`
}
