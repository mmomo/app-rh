import { describe, expect, it } from 'vitest'
import { datosDesdeForm, formVacio, MENSAJE_OBLIGATORIO, validarEmpleado, type FormEmpleado } from './empleado'

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

  it('rechaza fechas inexistentes', () => {
    expect(validarEmpleado({ ...formValido, fechaIngreso: '2023-02-30' }).fechaIngreso).toBeDefined()
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
