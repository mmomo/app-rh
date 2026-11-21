import { calcularAntiguedad } from './antiguedad'
import { esFechaISOValida, formatearFecha, hoyISO } from './fechas'
import { cumpleSalarioMinimo, MENSAJE_SALARIO_MINIMO } from './salarioMinimo'
import type { Aumento, DatosEmpleado, Empleado, Errores, Permiso } from './tipos'

/** Valores del formulario de empleado tal como se capturan (texto). */
export type FormEmpleado = {
  nombre: string
  apellidos: string
  fechaNacimiento: string
  nss: string
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

/** R7: edad y antigüedad máximas, en años cumplidos a hoy. */
export const EDAD_MAXIMA = 100
export const ANTIGUEDAD_MAXIMA = 100

const OBLIGATORIOS: CampoEmpleado[] = [
  'nombre',
  'apellidos',
  'fechaNacimiento',
  'nss',
  'puesto',
  'departamento',
  'fechaIngreso',
  'salarioInicial',
]

export const formVacio: FormEmpleado = {
  nombre: '',
  apellidos: '',
  fechaNacimiento: '',
  nss: '',
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
    nss: e.nss ?? '',
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
  /** Empleados ya registrados, para validar que el NSS no se repita. */
  empleados?: Empleado[]
  /** Al editar: id del empleado, que se excluye de la búsqueda de NSS repetido. */
  idActual?: string
}

/**
 * R1: los campos obligatorios no pueden quedar vacíos.
 * R2b: el salario inicial debe ser mayor a 0.
 * R3: el salario mensual capturado no puede ser menor al mínimo general vigente.
 * R4: a la fecha de ingreso debía tener al menos 18 años.
 * R5: el NSS tiene 11 dígitos y no puede estar asignado a otro empleado activo (sí a un ex empleado: recontratación).
 * R7: hoy no puede tener más de 100 años de edad ni de antigüedad.
 * R2c: la fecha de ingreso no puede ser futura ni posterior al historial ya registrado.
 */
export function validarEmpleado(
  form: FormEmpleado,
  { hoy = hoyISO(), primerMovimiento, salarioGuardado, empleados = [], idActual }: OpcionesValidacion = {},
): Errores<CampoEmpleado> {
  const errores: Errores<CampoEmpleado> = {}
  for (const campo of OBLIGATORIOS) {
    if (form[campo].trim() === '') errores[campo] = MENSAJE_OBLIGATORIO
  }
  if (!errores.fechaIngreso && !esFechaISOValida(form.fechaIngreso)) {
    errores.fechaIngreso = 'Ingresa una fecha válida.'
  } else if (!errores.fechaIngreso && form.fechaIngreso > hoy) {
    errores.fechaIngreso = 'La fecha de ingreso no puede ser futura.'
  } else if (!errores.fechaIngreso && calcularAntiguedad(form.fechaIngreso, hoy).anios > ANTIGUEDAD_MAXIMA) {
    errores.fechaIngreso = `Tendría ${calcularAntiguedad(form.fechaIngreso, hoy).anios} años de antigüedad; el máximo es ${ANTIGUEDAD_MAXIMA}.`
  } else if (!errores.fechaIngreso && primerMovimiento && form.fechaIngreso > primerMovimiento) {
    errores.fechaIngreso = `Tiene permisos o aumentos desde el ${formatearFecha(primerMovimiento)}; la fecha de ingreso no puede ser posterior.`
  }
  if (!errores.fechaNacimiento && !esFechaISOValida(form.fechaNacimiento)) {
    errores.fechaNacimiento = 'Ingresa una fecha válida.'
  } else if (!errores.fechaNacimiento && form.fechaNacimiento > hoy) {
    errores.fechaNacimiento = 'La fecha de nacimiento no puede ser futura.'
  } else if (!errores.fechaNacimiento && calcularEdad(form.fechaNacimiento, hoy) > EDAD_MAXIMA) {
    errores.fechaNacimiento = `Tendría ${calcularEdad(form.fechaNacimiento, hoy)} años; la edad máxima es ${EDAD_MAXIMA}.`
  } else if (!errores.fechaNacimiento && !errores.fechaIngreso) {
    const edad = calcularEdad(form.fechaNacimiento, form.fechaIngreso)
    if (form.fechaNacimiento >= form.fechaIngreso) {
      errores.fechaNacimiento = 'La fecha de nacimiento debe ser anterior a la de ingreso.'
    } else if (edad < EDAD_MINIMA) {
      errores.fechaNacimiento = `A su fecha de ingreso (${formatearFecha(form.fechaIngreso)}) tenía ${edad} ${edad === 1 ? 'año' : 'años'}; es menor de edad.`
    }
  }
  if (!errores.nss) {
    const nss = form.nss.trim()
    const otro = empleados.find((e) => e.nss === nss && e.id !== idActual && !e.baja)
    if (!/^\d{11}$/.test(nss)) errores.nss = 'El NSS debe tener exactamente 11 dígitos.'
    else if (otro) errores.nss = `Este NSS ya está asignado a ${nombreCompleto(otro)}.`
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
    nss: form.nss.trim(),
    puesto: form.puesto.trim(),
    departamento: form.departamento.trim(),
    fechaIngreso: form.fechaIngreso,
    salarioInicial: Number(form.salarioInicial),
    ...(email && { email }),
    ...(telefono && { telefono }),
  }
}

/** R5 con A8: ex empleado que tuvo este NSS, para informar de una recontratación. */
export function exEmpleadoConNss(nss: string, empleados: Empleado[], idActual?: string): Empleado | undefined {
  const limpio = nss.trim()
  return limpio === '' ? undefined : empleados.find((e) => e.baja && e.nss === limpio && e.id !== idActual)
}

/** Registros anteriores a v1.2 pueden no tener NSS ni fecha de nacimiento. */
export function datosIncompletos(e: Empleado): boolean {
  return !e.nss || !e.fechaNacimiento
}

/** R7: años de edad o de antigüedad que rebasan el máximo con el paso del tiempo (vacío si cumple o es ex empleado). */
export function excesoDeAnios(e: Empleado, hoy: string = hoyISO()): { edad?: number; antiguedad?: number } {
  if (e.baja) return {}
  const edad = e.fechaNacimiento ? calcularEdad(e.fechaNacimiento, hoy) : 0
  const antiguedad = calcularAntiguedad(e.fechaIngreso, hoy).anios
  return {
    ...(edad > EDAD_MAXIMA && { edad }),
    ...(antiguedad > ANTIGUEDAD_MAXIMA && { antiguedad }),
  }
}

export function superaLimiteAnios(e: Empleado, hoy?: string): boolean {
  return Object.keys(excesoDeAnios(e, hoy)).length > 0
}

export function nombreCompleto(e: Pick<Empleado, 'nombre' | 'apellidos'>): string {
  return `${e.nombre} ${e.apellidos}`
}
