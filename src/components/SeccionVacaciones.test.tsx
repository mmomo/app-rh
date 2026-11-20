import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from '../data/store'
import { renderApp } from '../test/utils'

const cifra = (nombre: string) => screen.getByText(nombre, { selector: 'dt' }).nextElementSibling

function alta(fechaIngreso: string, nombre = 'Ana') {
  return store.crearEmpleado({
    nombre, apellidos: 'López', puesto: 'Analista', departamento: 'Finanzas',
    fechaIngreso, salarioInicial: 10000, fechaNacimiento: '1990-05-20', nss: `1234567890${nombre.length}`,
  })
}

describe('vacaciones (A6)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 20, 12))
  })
  afterEach(() => vi.useRealTimers())

  it('criterio de aceptación: ingreso 15/03/2020 → 22; vacaciones 30/11–06/12/2026 → usados 5, restantes 17', async () => {
    const ana = alta('2020-03-15')
    const { user } = renderApp(`/empleados/${ana.id}`)
    expect(cifra('Corresponden')).toHaveTextContent('22')
    expect(cifra('Usados')).toHaveTextContent('0')
    expect(cifra('Restantes')).toHaveTextContent('22')
    expect(screen.getByText(/Periodo vacacional 15\/03\/2026 – 14\/03\/2027 \(6 años de servicio/)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Vacaciones' }))
    await user.type(screen.getByLabelText(/^Fecha de inicio/), '2026-11-30')
    await user.type(screen.getByLabelText(/^Fecha de fin/), '2026-12-06')
    await user.click(screen.getByRole('button', { name: 'Registrar permiso' }))

    expect(cifra('Usados')).toHaveTextContent('5')
    expect(cifra('Restantes')).toHaveTextContent('17')
  })

  it('con menos de un año muestra cuándo tendrá derecho', () => {
    const nuevo = alta('2026-05-20')
    renderApp(`/empleados/${nuevo.id}`)
    expect(screen.getByText(/Aún sin derecho a vacaciones; tendrá 12 días a partir del 20\/05\/2027/)).toBeInTheDocument()
  })

  it('la lista muestra las vacaciones restantes de cada empleado', () => {
    const ana = alta('2020-03-15')
    alta('2026-05-20', 'Luisa')
    store.crearPermiso({ empleadoId: ana.id, tipo: 'VACACIONES', fechaInicio: '2026-11-30', fechaFin: '2026-12-06' })
    renderApp()
    const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(filas[0]).toHaveTextContent('Ana López')
    expect(filas[0]).toHaveTextContent('17 de 22')
    expect(filas[1]).toHaveTextContent('Sin derecho aún')
  })
})
