import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { store } from '../data/store'
import { renderApp } from '../test/utils'

function altaAna() {
  return store.crearEmpleado({
    nombre: 'Ana', apellidos: 'López', puesto: 'Analista', departamento: 'Finanzas',
    fechaIngreso: '2020-03-15', salarioInicial: 10000,
  })
}

const vigente = () => screen.getByText('Salario vigente').nextElementSibling

describe('aumentos salariales (A3, R2b)', () => {
  it('criterio de aceptación: $10,000 + aumento a $11,500 → vigente $11,500 e historial con ambos', async () => {
    const ana = altaAna()
    const { user } = renderApp(`/empleados/${ana.id}`)
    expect(vigente()).toHaveTextContent('$10,000.00')

    await user.type(screen.getByLabelText(/^Nuevo salario/), '11500')
    await user.type(screen.getByLabelText(/^Motivo del aumento/), 'Evaluación anual')
    await user.click(screen.getByRole('button', { name: 'Registrar aumento' }))

    expect(vigente()).toHaveTextContent('$11,500.00')
    const filas = within(screen.getByRole('table', { name: 'Historial salarial' })).getAllByRole('row').slice(1)
    expect(filas).toHaveLength(2)
    expect(filas[0]).toHaveTextContent('Salario inicial$10,000.00')
    expect(filas[1]).toHaveTextContent('Aumento: Evaluación anual$11,500.00 Vigente')
    expect(screen.getByText(/^Aumento registrado/)).toHaveAttribute('role', 'status')
  })

  it('caso de prueba R2b: vigente $10,000, aumento a $9,500 → bloqueado', async () => {
    const ana = altaAna()
    const { user } = renderApp(`/empleados/${ana.id}`)
    await user.type(screen.getByLabelText(/^Nuevo salario/), '9500')
    await user.click(screen.getByRole('button', { name: 'Registrar aumento' }))

    const campo = screen.getByLabelText(/^Nuevo salario/)
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo).toHaveAccessibleDescription(/mayor al vigente/)
    expect(store.getEstado().aumentos).toEqual([])
    expect(vigente()).toHaveTextContent('$10,000.00')
  })

  it('la lista muestra el salario vigente y la edición bloquea el salario inicial', async () => {
    const ana = altaAna()
    store.crearAumento({ empleadoId: ana.id, fecha: '2025-01-01', salarioNuevo: 11500 })
    const { user } = renderApp()
    expect(within(screen.getByRole('table')).getByText('$11,500.00')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Editar a Ana López' }))
    expect(screen.getByLabelText(/^Salario mensual inicial/)).toHaveAttribute('readonly')
  })
})
