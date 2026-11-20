import { describe, expect, it } from 'vitest'
import {
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
      ['apellidos', 'departamento', 'fechaIngreso', 'nombre', 'puesto', 'salarioInicial'].sort(),
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
      puesto: 'Analista',
      departamento: 'Finanzas',
      fechaIngreso: '2020-03-15',
      salarioInicial: 10000,
    })
  })
})
