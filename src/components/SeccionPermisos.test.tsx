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

describe('permisos (A2, R2a)', () => {
  it('criterio de aceptación: un permiso de cada tipo queda en el historial con su tipo visible', async () => {
    const ana = altaAna()
    const { user } = renderApp(`/empleados/${ana.id}`)
    expect(screen.getByText('Sin permisos registrados.')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Con goce de sueldo'))
    await user.type(screen.getByLabelText(/^Fecha de inicio/), '2026-12-05')
    await user.type(screen.getByLabelText(/^Fecha de fin/), '2026-12-10')
    await user.click(screen.getByRole('button', { name: 'Registrar permiso' }))

    await user.click(screen.getByLabelText('Sin goce de sueldo'))
    await user.type(screen.getByLabelText(/^Fecha de inicio/), '2026-06-01')
    await user.type(screen.getByLabelText(/^Fecha de fin/), '2026-06-01')
    await user.type(screen.getByLabelText(/^Motivo del permiso/), 'Trámite personal')
    await user.click(screen.getByRole('button', { name: 'Registrar permiso' }))

    const filas = within(screen.getByRole('table', { name: 'Historial de permisos' })).getAllByRole('row').slice(1)
    expect(filas).toHaveLength(2)
    expect(filas[0]).toHaveTextContent('Con goce de sueldo05/12/202610/12/20266—')
    expect(filas[1]).toHaveTextContent('Sin goce de sueldo01/06/202601/06/20261Trámite personal')
  })

  it('caso de prueba R2a: inicio 10/12, fin 05/12 → bloqueado', async () => {
    const ana = altaAna()
    const { user } = renderApp(`/empleados/${ana.id}`)
    await user.click(screen.getByLabelText('Sin goce de sueldo'))
    await user.type(screen.getByLabelText(/^Fecha de inicio/), '2026-12-10')
    await user.type(screen.getByLabelText(/^Fecha de fin/), '2026-12-05')
    await user.click(screen.getByRole('button', { name: 'Registrar permiso' }))

    const fin = screen.getByLabelText(/^Fecha de fin/)
    expect(fin).toHaveAttribute('aria-invalid', 'true')
    expect(fin).toHaveAccessibleDescription('La fecha de fin no puede ser anterior a la de inicio.')
    expect(fin).toHaveFocus()
    expect(store.getEstado().permisos).toEqual([])
  })

  it('exige seleccionar el tipo de permiso', async () => {
    const ana = altaAna()
    const { user } = renderApp(`/empleados/${ana.id}`)
    await user.type(screen.getByLabelText(/^Fecha de inicio/), '2026-12-01')
    await user.type(screen.getByLabelText(/^Fecha de fin/), '2026-12-01')
    await user.click(screen.getByRole('button', { name: 'Registrar permiso' }))
    expect(screen.getByText('Selecciona el tipo de permiso.')).toBeInTheDocument()
    expect(screen.getByLabelText('Con goce de sueldo')).toHaveFocus()
  })
})

describe('consistencia con la fecha de ingreso (R2c)', () => {
  it('caso de prueba: ingreso 15/03/2020, permiso con inicio 01/01/2020 → bloqueado', async () => {
    const ana = altaAna()
    const { user } = renderApp(`/empleados/${ana.id}`)
    await user.click(screen.getByLabelText('Con goce de sueldo'))
    await user.type(screen.getByLabelText(/^Fecha de inicio/), '2020-01-01')
    await user.type(screen.getByLabelText(/^Fecha de fin/), '2020-01-02')
    await user.click(screen.getByRole('button', { name: 'Registrar permiso' }))

    const inicio = screen.getByLabelText(/^Fecha de inicio/)
    expect(inicio).toHaveAttribute('aria-invalid', 'true')
    expect(inicio).toHaveAccessibleDescription('El permiso no puede iniciar antes del ingreso (15/03/2020).')
    expect(store.getEstado().permisos).toEqual([])
  })
})
