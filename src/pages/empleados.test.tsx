import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '../test/utils'
import { store } from '../data/store'

describe('CRUD de empleados (A1)', () => {
  it('criterio de aceptación: se crea, aparece en la lista, se edita y se elimina', async () => {
    const { user } = renderApp()

    // Crear
    await user.click(screen.getByRole('link', { name: 'Nuevo empleado' }))
    await user.type(screen.getByLabelText(/^Nombre/), 'Ana')
    await user.type(screen.getByLabelText(/^Apellidos/), 'López')
    await user.type(screen.getByLabelText(/^Puesto/), 'Analista')
    await user.type(screen.getByLabelText(/^Departamento/), 'Finanzas')
    await user.type(screen.getByLabelText(/^Fecha de ingreso/), '2020-03-15')
    await user.type(screen.getByLabelText(/^Salario inicial/), '10000')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByRole('heading', { name: 'Ana López' })).toBeInTheDocument()

    // Aparece en la lista
    await user.click(screen.getByRole('link', { name: /Volver a la lista/ }))
    const tabla = screen.getByRole('table')
    expect(within(tabla).getByRole('link', { name: 'Ana López' })).toBeInTheDocument()
    expect(within(tabla).getByText('Analista')).toBeInTheDocument()

    // Editar
    await user.click(screen.getByRole('link', { name: 'Editar a Ana López' }))
    const puesto = screen.getByLabelText(/^Puesto/)
    await user.clear(puesto)
    await user.type(puesto, 'Gerente')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await user.click(screen.getByRole('link', { name: /Volver a la lista/ }))
    expect(within(screen.getByRole('table')).getByText('Gerente')).toBeInTheDocument()
    expect(screen.queryByText('Analista')).not.toBeInTheDocument()

    // Eliminar
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Eliminar a Ana López' }))
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText('Aún no hay empleados registrados.')).toBeInTheDocument()
    expect(localStorage.getItem('app-rh:datos:v1')).toContain('"empleados":[]')
  })

  it('no elimina si se cancela la confirmación', async () => {
    store.crearEmpleado({
      nombre: 'Luis', apellidos: 'Pérez', puesto: 'Dev', departamento: 'TI',
      fechaIngreso: '2021-01-01', salarioInicial: 20000,
    })
    const { user } = renderApp()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    await user.click(screen.getByRole('button', { name: 'Eliminar a Luis Pérez' }))
    expect(screen.getByRole('link', { name: 'Luis Pérez' })).toBeInTheDocument()
  })

  it('filtra la lista por nombre', async () => {
    const base = { puesto: 'Dev', departamento: 'TI', fechaIngreso: '2021-01-01', salarioInicial: 20000 }
    store.crearEmpleado({ nombre: 'Luis', apellidos: 'Pérez', ...base })
    store.crearEmpleado({ nombre: 'Marta', apellidos: 'Ruiz', ...base })
    const { user } = renderApp()
    await user.type(screen.getByLabelText('Buscar por nombre'), 'mar')
    expect(screen.getByRole('link', { name: 'Marta Ruiz' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Luis Pérez' })).not.toBeInTheDocument()
  })
})

describe('datos obligatorios (R1)', () => {
  it('caso de prueba: guardar sin fecha de ingreso → bloqueado y se marca el campo', async () => {
    const { user } = renderApp('/empleados/nuevo')
    await user.type(screen.getByLabelText(/^Nombre/), 'Ana')
    await user.type(screen.getByLabelText(/^Apellidos/), 'López')
    await user.type(screen.getByLabelText(/^Puesto/), 'Analista')
    await user.type(screen.getByLabelText(/^Departamento/), 'Finanzas')
    await user.type(screen.getByLabelText(/^Salario inicial/), '10000')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const fecha = screen.getByLabelText(/^Fecha de ingreso/)
    expect(fecha).toHaveAttribute('aria-invalid', 'true')
    expect(fecha).toHaveAccessibleDescription('Este campo es obligatorio.')
    expect(fecha).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Nuevo empleado' })).toBeInTheDocument()
    expect(store.getEstado().empleados).toEqual([])
  })
})
