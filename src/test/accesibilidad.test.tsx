import { screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { store } from '../data/store'
import { renderApp } from './utils'

// A5: complementa la auditoría de Lighthouse (que usa axe-core) en cada pantalla.
// jsdom no calcula estilos, por lo que el contraste de color se verifica con Lighthouse.
// jsdom no implementa canvas; axe lo usa solo para detectar ligaduras de íconos.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext

async function violaciones() {
  const resultado = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } })
  return resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

function altaConHistorial() {
  const ana = store.crearEmpleado({
    nombre: 'Ana', apellidos: 'López', puesto: 'Analista', departamento: 'Finanzas',
    fechaIngreso: '2020-03-15', salarioInicial: 10000,
  })
  store.crearAumento({ empleadoId: ana.id, fecha: '2025-01-01', salarioNuevo: 11500 })
  store.crearPermiso({ empleadoId: ana.id, tipo: 'CON_GOCE', fechaInicio: '2025-02-03', fechaFin: '2025-02-04' })
  return ana
}

describe('accesibilidad (A5)', () => {
  it('lista de empleados', async () => {
    altaConHistorial()
    renderApp('/empleados')
    expect(await violaciones()).toEqual([])
  })

  it('formulario con errores de validación', async () => {
    const { user } = renderApp('/empleados/nuevo')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await violaciones()).toEqual([])
  })

  it('detalle con historial y errores en los formularios', async () => {
    const ana = altaConHistorial()
    const { user } = renderApp(`/empleados/${ana.id}`)
    await user.click(screen.getByRole('button', { name: 'Registrar aumento' }))
    await user.click(screen.getByRole('button', { name: 'Registrar permiso' }))
    expect(await violaciones()).toEqual([])
  })

  it('todos los campos tienen una etiqueta visible asociada', () => {
    const ana = altaConHistorial()
    for (const ruta of ['/empleados', '/empleados/nuevo', `/empleados/${ana.id}`]) {
      const { unmount } = renderApp(ruta)
      for (const input of document.querySelectorAll('input')) {
        expect(input.labels?.length, `#${input.id} en ${ruta}`).toBeGreaterThan(0)
      }
      unmount()
    }
  })
})
