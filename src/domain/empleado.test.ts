import { describe, expect, it } from 'vitest'
import {
  calcularEdad,
  datosDesdeForm,
  fechaPrimerMovimiento,
  formVacio,
  MENSAJE_OBLIGATORIO,
  validarEmpleado,
  type FormEmpleado,
} from './empleado'

const formValido: FormEmpleado = {
  ...formVacio,
  nombre: 'Ana',
  apellidos: 'López',
  fechaNacimiento: '1990-05-20',
  nss: '12345678901',
  puesto: 'Analista',
  departamento: 'Finanzas',
  fechaIngreso: '2020-03-15',
  salarioInicial: '10000',
}

describe('validarEmpleado (R1)', () => {
  it('acepta un formulario con todos los obligatorios', () => {
    expect(validarEmpleado(formValido)).toEqual({})
  })

  it('caso de prueba: sin fecha de ingreso → bloqueado y se marca el campo', () => {
    expect(validarEmpleado({ ...formValido, fechaIngreso: '' })).toEqual({
      fechaIngreso: MENSAJE_OBLIGATORIO,
    })
  })

  it('marca todos los obligatorios vacíos y no los opcionales', () => {
    const errores = validarEmpleado(formVacio)
    expect(Object.keys(errores).sort()).toEqual(
      ['apellidos', 'departamento', 'fechaIngreso', 'fechaNacimiento', 'nombre', 'nss', 'puesto', 'salarioInicial'].sort(),
    )
  })

  it('considera vacío un campo con solo espacios', () => {
    expect(validarEmpleado({ ...formValido, nombre: '   ' }).nombre).toBe(MENSAJE_OBLIGATORIO)
  })

  it('R2b: rechaza salario inicial de $0 o negativo', () => {
    expect(validarEmpleado({ ...formValido, salarioInicial: '0' }).salarioInicial).toBe('El salario debe ser mayor a $0.')
    expect(validarEmpleado({ ...formValido, salarioInicial: '-5' }).salarioInicial).toBe('El salario debe ser mayor a $0.')
  })

  it('R3 caso de prueba: salario inicial $9,000 → bloqueado; $9,582.47 → aceptado', () => {
    expect(validarEmpleado({ ...formValido, salarioInicial: '9000' }).salarioInicial).toMatch(/mínimo general 2026 \(\$9,582\.47\)/)
    expect(validarEmpleado({ ...formValido, salarioInicial: '9582.47' })).toEqual({})
  })

  it('R3: al editar, un salario guardado previo al mínimo vigente no bloquea si no cambia', () => {
    expect(validarEmpleado({ ...formValido, salarioInicial: '5000' }, { salarioGuardado: 5000 })).toEqual({})
    expect(validarEmpleado({ ...formValido, salarioInicial: '6000' }, { salarioGuardado: 5000 }).salarioInicial).toBeDefined()
  })

  it('rechaza fechas inexistentes', () => {
    expect(validarEmpleado({ ...formValido, fechaIngreso: '2023-02-30' }).fechaIngreso).toBeDefined()
  })
})

describe('validarEmpleado (R2c)', () => {
  const HOY = '2026-11-19'

  it('rechaza una fecha de ingreso futura y acepta hoy', () => {
    expect(validarEmpleado({ ...formValido, fechaIngreso: '2026-11-20' }, { hoy: HOY }).fechaIngreso).toBe(
      'La fecha de ingreso no puede ser futura.',
    )
    expect(validarEmpleado({ ...formValido, fechaIngreso: HOY }, { hoy: HOY })).toEqual({})
  })

  it('al editar, no permite mover el ingreso después del primer permiso o aumento', () => {
    const errores = validarEmpleado({ ...formValido, fechaIngreso: '2024-06-01' }, { hoy: HOY, primerMovimiento: '2024-01-10' })
    expect(errores.fechaIngreso).toMatch(/10\/01\/2024/)
    expect(validarEmpleado(formValido, { hoy: HOY, primerMovimiento: '2024-01-10' })).toEqual({})
  })
})

describe('validarEmpleado (R4)', () => {
  const nacimiento = '2005-05-20'

  it('caso de prueba: nacimiento 20/05/2005, ingreso 19/05/2023 → bloqueado', () => {
    expect(validarEmpleado({ ...formValido, fechaNacimiento: nacimiento, fechaIngreso: '2023-05-19' })).toEqual({
      fechaNacimiento: 'Debe tener al menos 18 años a su fecha de ingreso (19/05/2023).',
    })
  })

  it('caso de prueba: nacimiento 20/05/2005, ingreso 20/05/2023 (cumple 18) → aceptado', () => {
    expect(validarEmpleado({ ...formValido, fechaNacimiento: nacimiento, fechaIngreso: '2023-05-20' })).toEqual({})
  })

  it('rechaza nacimiento futuro o posterior al ingreso', () => {
    expect(validarEmpleado({ ...formValido, fechaNacimiento: '2027-01-01' }, { hoy: '2026-11-19' }).fechaNacimiento).toBe(
      'La fecha de nacimiento no puede ser futura.',
    )
    expect(validarEmpleado({ ...formValido, fechaNacimiento: '2021-01-01' }).fechaNacimiento).toBeDefined()
  })

  it('calcula la edad en años cumplidos', () => {
    expect(calcularEdad('2005-05-20', '2023-05-19')).toBe(17)
    expect(calcularEdad('2005-05-20', '2023-05-20')).toBe(18)
  })
})

describe('validarEmpleado (R5)', () => {
  const ana = { id: 'e1', ...datosDesdeForm(formValido) }

  it('caso de prueba: Ana con NSS 12345678901; alta de Luis con el mismo NSS → bloqueado', () => {
    const luis = { ...formValido, nombre: 'Luis', apellidos: 'Pérez' }
    expect(validarEmpleado(luis, { empleados: [ana] })).toEqual({ nss: 'Este NSS ya está asignado a Ana López.' })
  })

  it('al editar, el propio NSS no cuenta como repetido', () => {
    expect(validarEmpleado(formValido, { empleados: [ana], idActual: 'e1' })).toEqual({})
  })

  it('caso de prueba: NSS de 10 dígitos → bloqueado; también letras, guiones o 12 dígitos', () => {
    for (const nss of ['1234567890', '1234567890A', '1234-567890', '123456789012']) {
      expect(validarEmpleado({ ...formValido, nss }).nss).toBe('El NSS debe tener exactamente 11 dígitos.')
    }
  })

  it('ignora espacios en los extremos', () => {
    expect(validarEmpleado({ ...formValido, nss: ' 12345678901 ' })).toEqual({})
    expect(datosDesdeForm({ ...formValido, nss: ' 12345678901 ' }).nss).toBe('12345678901')
  })
})

describe('fechaPrimerMovimiento', () => {
  it('devuelve la fecha más antigua entre permisos y aumentos del empleado', () => {
    const permisos = [{ id: 'p', empleadoId: 'e1', tipo: 'CON_GOCE' as const, fechaInicio: '2024-05-01', fechaFin: '2024-05-02' }]
    const aumentos = [
      { id: 'a', empleadoId: 'e1', fecha: '2024-02-01', salarioNuevo: 1 },
      { id: 'b', empleadoId: 'e2', fecha: '2021-01-01', salarioNuevo: 1 },
    ]
    expect(fechaPrimerMovimiento('e1', permisos, aumentos)).toBe('2024-02-01')
    expect(fechaPrimerMovimiento('e3', permisos, aumentos)).toBeUndefined()
  })
})

describe('datosDesdeForm', () => {
  it('recorta textos, convierte el salario y omite opcionales vacíos', () => {
    expect(datosDesdeForm({ ...formValido, nombre: ' Ana ', email: '  ' })).toEqual({
      nombre: 'Ana',
      apellidos: 'López',
      fechaNacimiento: '1990-05-20',
      nss: '12345678901',
      puesto: 'Analista',
      departamento: 'Finanzas',
      fechaIngreso: '2020-03-15',
      salarioInicial: 10000,
    })
  })
})
