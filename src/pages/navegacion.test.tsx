import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test/utils'

describe('navegación (A9)', () => {
  it('el inicio y las rutas desconocidas llevan al panel, marcado en el menú', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Panel de RH' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Panel' })).toHaveAttribute('aria-current', 'page')
  })

  it('el menú lleva a Empleados y lo marca como página actual, también en sus subpáginas', async () => {
    const { user } = renderApp('/otra')
    await user.click(screen.getByRole('link', { name: 'Empleados' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Empleados' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Nuevo empleado' }))
    expect(screen.getByRole('link', { name: 'Empleados' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Panel' })).not.toHaveAttribute('aria-current')
  })
})
