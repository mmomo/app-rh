import { calcularAntiguedad } from './antiguedad'
import { esFechaISOValida, formatearFecha, hoyISO } from './fechas'
import { cumpleSalarioMinimo, MENSAJE_SALARIO_MINIMO } from './salarioMinimo'
import type { Aumento, DatosEmpleado, Empleado, Errores, Permiso } from './tipos'

/** Valores del formulario de empleado tal como se capturan (texto). */
export type FormEmpleado = {
  nombre: string
  apellidos: string
  fechaNacimiento: string
  puesto: string
  departamento: string
  fechaIngreso: string
  salarioInicial: string
  email: string
  telefono: string
}

export type CampoEmpleado = keyof FormEmpleado

export const MENSAJE_OBLIGATORIO = 'Este campo es obligatorio.'

/** R4: mayoría de edad en México. */
export const EDAD_MINIMA = 18

const OBLIGATORIOS: CampoEmpleado[] = [
  'nombre',
  'apellidos',
  'fechaNacimiento',
  'puesto',
  'departamento',
  'fechaIngreso',
  'salarioInicial',
]

export const formVacio: FormEmpleado = {
  nombre: '',
  apellidos: '',
  fechaNacimiento: '',
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
    fechaNacimiento: e.fechaNacimiento ?? '',
    puesto: e.puesto,
    departamento: e.departamento,
    fechaIngreso: e.fechaIngreso,
    salarioInicial: String(e.salarioInicial),
    email: e.email ?? '',
    telefono: e.telefono ?? '',
  }
}

/** Años cumplidos a la fecha indicada. */
export function calcularEdad(fechaNacimiento: string, aFecha: string = hoyISO()): number {
  return calcularAntiguedad(fechaNacimiento, aFecha).anios
}

/** Fecha más antigua entre los permisos y aumentos del empleado, si tiene alguno. */
export function fechaPrimerMovimiento(empleadoId: string, permisos: Permiso[], aumentos: Aumento[]): string | undefined {
  const fechas = [
    ...permisos.filter((p) => p.empleadoId === empleadoId).map((p) => p.fechaInicio),
    ...aumentos.filter((a) => a.empleadoId === empleadoId).map((a) => a.fecha),
  ]
  return fechas.sort()[0]
}

type OpcionesValidacion = {
  hoy?: string
  /** Al editar: fecha del primer permiso o aumento registrado. */
  primerMovimiento?: string
  /** Al editar: salario inicial guardado; si no cambia, no se vuelve a validar contra el mínimo vigente. */
  salarioGuardado?: number
}

/**
 * R1: los campos obligatorios no pueden quedar vacíos.
 * R2b: el salario inicial debe ser mayor a 0.
 * R3: el salario mensual capturado no puede ser menor al mínimo general vigente.
 * R4: a la fecha de ingreso debía tener al menos 18 años.
 * R2c: la fecha de ingreso no puede ser futura ni posterior al historial ya registrado.
 */
export function validarEmpleado(
  form: FormEmpleado,
  { hoy = hoyISO(), primerMovimiento, salarioGuardado }: OpcionesValidacion = {},
): Errores<CampoEmpleado> {
  const errores: Errores<CampoEmpleado> = {}
  for (const campo of OBLIGATORIOS) {
    if (form[campo].trim() === '') errores[campo] = MENSAJE_OBLIGATORIO
  }
  if (!errores.fechaIngreso && !esFechaISOValida(form.fechaIngreso)) {
    errores.fechaIngreso = 'Ingresa una fecha válida.'
  } else if (!errores.fechaIngreso && form.fechaIngreso > hoy) {
    errores.fechaIngreso = 'La fecha de ingreso no puede ser futura.'
  } else if (!errores.fechaIngreso && primerMovimiento && form.fechaIngreso > primerMovimiento) {
    errores.fechaIngreso = `Tiene permisos o aumentos desde el ${formatearFecha(primerMovimiento)}; la fecha de ingreso no puede ser posterior.`
  }
  if (!errores.fechaNacimiento && !esFechaISOValida(form.fechaNacimiento)) {
    errores.fechaNacimiento = 'Ingresa una fecha válida.'
  } else if (!errores.fechaNacimiento && form.fechaNacimiento > hoy) {
    errores.fechaNacimiento = 'La fecha de nacimiento no puede ser futura.'
  } else if (!errores.fechaNacimiento && !errores.fechaIngreso) {
    const edad = calcularEdad(form.fechaNacimiento, form.fechaIngreso)
    if (form.fechaNacimiento > form.fechaIngreso || edad < EDAD_MINIMA) {
      errores.fechaNacimiento = `Debe tener al menos ${EDAD_MINIMA} años a su fecha de ingreso (${formatearFecha(form.fechaIngreso)}).`
    }
  }
  if (!errores.salarioInicial) {
    const salario = Number(form.salarioInicial)
    if (!Number.isFinite(salario)) errores.salarioInicial = 'Ingresa un monto numérico.'
    else if (salario <= 0) errores.salarioInicial = 'El salario debe ser mayor a $0.'
    else if (salario !== salarioGuardado && !cumpleSalarioMinimo(salario)) errores.salarioInicial = MENSAJE_SALARIO_MINIMO
  }
  return errores
}

export function datosDesdeForm(form: FormEmpleado): DatosEmpleado {
  const email = form.email.trim()
  const telefono = form.telefono.trim()
  return {
    nombre: form.nombre.trim(),
    apellidos: form.apellidos.trim(),
    fechaNacimiento: form.fechaNacimiento,
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
