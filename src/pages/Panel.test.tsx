import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from '../data/store'
import { renderApp } from '../test/utils'

// Datos del criterio de aceptación de A9 (hoy 22/11/2026).
function datosCriterio() {
  const base = { puesto: 'Dev', fechaNacimiento: '1990-01-01' }
  const ana = store.crearEmpleado({ ...base, nombre: 'Ana', apellidos: 'López', nss: '11111111111', departamento: 'Finanzas', fechaIngreso: '2020-03-15', salarioInicial: 10000 })
  store.crearAumento({ empleadoId: ana.id, fecha: '2025-01-01', salarioNuevo: 11500 })
  store.crearEmpleado({ ...base, nombre: 'Luis', apellidos: 'Pérez', nss: '22222222222', departamento: 'TI', fechaIngreso: '2026-11-03', salarioInicial: 20000 })
  const rosa = store.crearEmpleado({ ...base, nombre: 'Rosa', apellidos: 'Díaz', nss: '33333333333', departamento: 'TI', fechaIngreso: '2019-02-01', salarioInicial: 15000 })
  store.darDeBaja(rosa.id, { fecha: '2026-11-10', motivo: 'RENUNCIA' })
  store.crearPermiso({ empleadoId: ana.id, tipo: 'CON_GOCE', fechaInicio: '2026-11-20', fechaFin: '2026-11-24' })
}

function tarjeta(nombre: string) {
  return screen.getByText(nombre, { selector: 'dt' }).parentElement!
}

describe('panel de resumen (A9)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 22, 12))
  })
  afterEach(() => vi.useRealTimers())

  it('criterio de aceptación: tarjetas de plantilla, nómina y ausencias', () => {
    datosCriterio()
    renderApp('/panel')
    expect(screen.getByText('Datos al 22/11/2026.')).toBeInTheDocument()
    expect(tarjeta('Plantilla activa')).toHaveTextContent('Plantilla activa2Sin cambio vs. octubre')
    expect(tarjeta('Nómina mensual vigente')).toHaveTextContent('$31,500.00+$5,000.00 (+18.9 %) vs. octubre')
    expect(tarjeta('Ausentes hoy')).toHaveTextContent('Ausentes hoy1de 2 activos')
  })

  it('plantilla: altas y bajas del mes, gráfica y tabla de 12 meses', () => {
    datosCriterio()
    renderApp('/panel')
    expect(screen.getByText(/En noviembre:/)).toHaveTextContent('En noviembre: 1 alta y 1 baja.')
    expect(screen.getByRole('img', { name: /Activos al cierre de cada mes, de diciembre 2025 a noviembre 2026/ })).toBeInTheDocument()
    const filas = within(screen.getByRole('table', { name: 'Activos, altas y bajas por mes' })).getAllByRole('row')
    expect(filas).toHaveLength(13)
    expect(filas[1]).toHaveTextContent('noviembre 2026 (al 22/11/2026)211')
    expect(filas[2]).toHaveTextContent('octubre 2026200')
  })

  it('nómina por departamento con promedio y porcentaje', () => {
    datosCriterio()
    renderApp('/panel')
    expect(screen.getByText(/salario promedio/).closest('p')).toHaveTextContent(
      'Total $31,500.00 · salario promedio $15,750.00 · al cierre de octubre: $26,500.00.',
    )
    const filas = within(screen.getByRole('table', { name: 'Nómina por departamento' })).getAllByRole('row')
    expect(filas[1]).toHaveTextContent('TI1$20,000.0063.5 %')
    expect(filas[2]).toHaveTextContent('Finanzas1$11,500.0036.5 %')
  })

  it('ausencias: quién falta hoy y los permisos del mes', () => {
    datosCriterio()
    renderApp('/panel')
    const hoy = within(screen.getByRole('table', { name: 'Empleados ausentes hoy' })).getAllByRole('row')[1]
    expect(hoy).toHaveTextContent('Ana LópezCon goce de sueldo24/11/2026')
    expect(within(hoy).getByRole('link', { name: 'Ana López' })).toHaveAttribute('href', expect.stringMatching(/^\/empleados\//))
    expect(screen.getByText(/^1 permiso de 1 persona/)).toHaveTextContent(
      '1 permiso de 1 persona: 1 con goce de sueldo · 0 sin goce de sueldo · 0 de vacaciones.',
    )
    expect(within(screen.getByRole('table', { name: 'Permisos del mes' })).getAllByRole('row')[1]).toHaveTextContent(
      'Ana LópezCon goce de sueldo20/11/202624/11/20265',
    )
  })

  it('vacaciones que cruzan al mes siguiente: un día laborable se escribe en singular', () => {
    datosCriterio()
    const ana = store.getEstado().empleados.find((e) => e.nombre === 'Ana')!
    store.crearPermiso({ empleadoId: ana.id, tipo: 'VACACIONES', fechaInicio: '2026-11-30', fechaFin: '2026-12-06' })
    renderApp('/panel')
    const filas = within(screen.getByRole('table', { name: 'Permisos del mes' })).getAllByRole('row')
    expect(filas.at(-1)).toHaveTextContent('30/11/202606/12/20261 laborable')
    expect(filas.at(-1)).not.toHaveTextContent('laborables')
  })

  it('sin empleados muestra los estados vacíos', () => {
    renderApp('/panel')
    expect(tarjeta('Plantilla activa')).toHaveTextContent('0Sin cambio vs. octubre')
    expect(screen.getByText('No hay empleados activos.')).toBeInTheDocument()
    expect(screen.getByText('Nadie está ausente hoy.')).toBeInTheDocument()
    expect(screen.getByText('No hay permisos este mes.')).toBeInTheDocument()
  })
})
