import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../test/utils'
import { EJEMPLOS } from '../data/ejemplos'
import { store } from '../data/store'

describe('CRUD de empleados (A1)', () => {
  it('criterio de aceptación: se crea, aparece en la lista, se edita y se da de baja', async () => {
    const { user } = renderApp()

    // Crear
    await user.click(screen.getByRole('link', { name: 'Nuevo empleado' }))
    await user.type(screen.getByLabelText(/^Nombre/), 'Ana')
    await user.type(screen.getByLabelText(/^Apellidos/), 'López')
    await user.type(screen.getByLabelText(/^Fecha de nacimiento/), '1990-05-20')
    await user.type(screen.getByLabelText(/^Número de Seguridad Social/), '12345678901')
    await user.type(screen.getByLabelText(/^Puesto/), 'Analista')
    await user.type(screen.getByLabelText(/^Departamento/), 'Finanzas')
    await user.type(screen.getByLabelText(/^Fecha de ingreso/), '2020-03-15')
    await user.type(screen.getByLabelText(/^Salario mensual inicial/), '10000')
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

    // Dar de baja (A8): ya no se elimina; el registro se conserva
    await user.click(screen.getByRole('link', { name: 'Dar de baja a Ana López' }))
    await user.type(screen.getByLabelText(/^Fecha de baja/), '2026-11-20')
    await user.click(screen.getByRole('radio', { name: 'Renuncia' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar baja' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ana López')
    expect(localStorage.getItem('app-rh:datos:v1')).toContain('"baja":{"fecha":"2026-11-20","motivo":"RENUNCIA"}')

    // Sale de Activos y queda en Ex empleados
    await user.click(screen.getByRole('link', { name: 'Empleados' }))
    expect(screen.getByText('No hay empleados activos.')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Ex empleados (1)' }))
    expect(within(screen.getByRole('table')).getByText('Ex empleado')).toBeInTheDocument()
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
    await user.type(screen.getByLabelText(/^Fecha de nacimiento/), '1990-05-20')
    await user.type(screen.getByLabelText(/^Número de Seguridad Social/), '12345678901')
    await user.type(screen.getByLabelText(/^Puesto/), 'Analista')
    await user.type(screen.getByLabelText(/^Departamento/), 'Finanzas')
    await user.type(screen.getByLabelText(/^Salario mensual inicial/), '10000')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const fecha = screen.getByLabelText(/^Fecha de ingreso/)
    expect(fecha).toHaveAttribute('aria-invalid', 'true')
    expect(fecha).toHaveAccessibleDescription('Este campo es obligatorio.')
    expect(fecha).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Nuevo empleado' })).toBeInTheDocument()
    expect(store.getEstado().empleados).toEqual([])
  })
})

describe('salario mínimo (R3)', () => {
  it('caso de prueba: salario inicial $9,000 → bloqueado con mensaje junto al campo', async () => {
    const { user } = renderApp('/empleados/nuevo')
    await user.type(screen.getByLabelText(/^Salario mensual inicial/), '9000')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    const salario = screen.getByLabelText(/^Salario mensual inicial/)
    expect(salario).toHaveAttribute('aria-invalid', 'true')
    expect(salario).toHaveAccessibleDescription(/no puede ser menor al mínimo general 2026 \(\$9,582\.47\)/)
  })
})

describe('edad mínima (R4)', () => {
  it('caso de prueba: nacimiento 20/05/2005, ingreso 19/05/2023 → bloqueado y se marca el campo', async () => {
    const { user } = renderApp('/empleados/nuevo')
    await user.type(screen.getByLabelText(/^Fecha de nacimiento/), '2005-05-20')
    await user.type(screen.getByLabelText(/^Fecha de ingreso/), '2023-05-19')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    const nacimiento = screen.getByLabelText(/^Fecha de nacimiento/)
    expect(nacimiento).toHaveAttribute('aria-invalid', 'true')
    expect(nacimiento).toHaveAccessibleDescription(/A su fecha de ingreso \(19\/05\/2023\) tenía 17 años; es menor de edad/)
  })
})

describe('NSS único (R5)', () => {
  it('caso de prueba: alta de Luis con el NSS de Ana → bloqueado y se marca el campo', async () => {
    store.crearEmpleado({
      nombre: 'Ana', apellidos: 'López', puesto: 'Analista', departamento: 'Finanzas',
      fechaIngreso: '2020-03-15', salarioInicial: 10000, fechaNacimiento: '1990-05-20', nss: '12345678901',
    })
    const { user } = renderApp('/empleados/nuevo')
    await user.type(screen.getByLabelText(/^Número de Seguridad Social/), '12345678901')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    const nss = screen.getByLabelText(/^Número de Seguridad Social/)
    expect(nss).toHaveAttribute('aria-invalid', 'true')
    expect(nss).toHaveAccessibleDescription(/Este NSS ya está asignado a Ana López/)
  })
})

describe('empleados registrados antes de v1.2', () => {
  it('muestran "Datos incompletos" y al editarlos se exigen NSS y fecha de nacimiento', async () => {
    store.crearEmpleado({
      nombre: 'Luis', apellidos: 'Pérez', puesto: 'Dev', departamento: 'TI',
      fechaIngreso: '2021-01-01', salarioInicial: 8000,
    })
    const { user } = renderApp()
    expect(screen.getByText('Datos incompletos')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Luis Pérez' }))
    expect(screen.getByText(/falta registrar el NSS o la fecha de nacimiento/)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Completar datos' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByLabelText(/^Número de Seguridad Social/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/^Fecha de nacimiento/)).toHaveAttribute('aria-invalid', 'true')
    // El salario guardado antes de R3 ($8,000) no bloquea la edición si no cambia.
    expect(screen.getByLabelText(/^Salario mensual inicial/)).not.toHaveAttribute('aria-invalid')

    await user.type(screen.getByLabelText(/^Fecha de nacimiento/), '1990-05-20')
    await user.type(screen.getByLabelText(/^Número de Seguridad Social/), '98765432109')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByRole('heading', { name: 'Luis Pérez' })).toBeInTheDocument()
    expect(screen.queryByText(/Datos incompletos/)).not.toBeInTheDocument()
  })
})

describe('baja de empleados (A8, R8)', () => {
  function altaLuis() {
    return store.crearEmpleado({
      nombre: 'Luis', apellidos: 'Pérez', puesto: 'Dev', departamento: 'TI',
      fechaIngreso: '2021-01-01', salarioInicial: 20000, nss: '98765432109', fechaNacimiento: '1990-05-20',
    })
  }

  it('no hay opción de eliminar; "Dar de baja" está en la lista y en el detalle', async () => {
    altaLuis()
    const { user } = renderApp()
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Luis Pérez' }))
    await user.click(screen.getByRole('link', { name: 'Dar de baja' }))
    expect(screen.getByRole('heading', { name: 'Dar de baja a Luis Pérez' })).toBeInTheDocument()
    expect(screen.getByText(/La baja es definitiva/)).toBeInTheDocument()
  })

  it('caso de prueba: sin fecha ni motivo o con fecha anterior al ingreso → bloqueado y se marcan los campos', async () => {
    const luis = altaLuis()
    const { user } = renderApp(`/empleados/${luis.id}/baja`)
    await user.click(screen.getByRole('button', { name: 'Confirmar baja' }))
    expect(screen.getByLabelText(/^Fecha de baja/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('radio', { name: 'Renuncia' })).toHaveAttribute('aria-invalid', 'true')

    await user.type(screen.getByLabelText(/^Fecha de baja/), '2020-01-01')
    await user.click(screen.getByRole('radio', { name: 'Despido' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar baja' }))
    expect(screen.getByText('La baja no puede ser anterior al ingreso (01/01/2021).')).toBeInTheDocument()
    expect(store.getEstado().empleados[0].baja).toBeUndefined()
  })

  it('Cancelar vuelve al expediente sin dar de baja', async () => {
    const luis = altaLuis()
    const { user } = renderApp(`/empleados/${luis.id}/baja`)
    await user.click(screen.getByRole('link', { name: 'Cancelar' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Luis Pérez')
    expect(store.getEstado().empleados[0].baja).toBeUndefined()
  })
})

describe('NSS único entre activos (R5 con A8)', () => {
  it('se puede dar de alta de nuevo a un ex empleado con su NSS y se informa a quién perteneció', async () => {
    const ana = store.crearEmpleado({
      nombre: 'Ana', apellidos: 'López', puesto: 'Dev', departamento: 'TI',
      fechaIngreso: '2021-01-01', salarioInicial: 20000, nss: '12345678901', fechaNacimiento: '1990-05-20',
    })
    store.darDeBaja(ana.id, { fecha: '2023-07-15', motivo: 'RENUNCIA' })
    const { user } = renderApp('/empleados/nuevo')
    await user.type(screen.getByLabelText(/^Nombre/), 'Ana')
    await user.type(screen.getByLabelText(/^Apellidos/), 'López')
    await user.type(screen.getByLabelText(/^Fecha de nacimiento/), '1990-05-20')
    await user.type(screen.getByLabelText(/^Número de Seguridad Social/), '12345678901')
    expect(screen.getByLabelText(/^Número de Seguridad Social/)).toHaveAccessibleDescription(
      'Este NSS perteneció a Ana López (ex empleado, baja el 15/07/2023); se permite para recontratación.',
    )
    await user.type(screen.getByLabelText(/^Puesto/), 'Líder técnica')
    await user.type(screen.getByLabelText(/^Departamento/), 'TI')
    await user.type(screen.getByLabelText(/^Fecha de ingreso/), '2025-02-01')
    await user.type(screen.getByLabelText(/^Salario mensual inicial/), '30000')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ana López')
    expect(store.getEstado().empleados.filter((e) => e.nss === '12345678901')).toHaveLength(2)
  })
})

describe('ex empleados (A8)', () => {
  function altaConBaja() {
    const base = { puesto: 'Dev', departamento: 'TI', fechaIngreso: '2021-01-01', salarioInicial: 20000 }
    store.crearEmpleado({ nombre: 'Ana', apellidos: 'López', ...base, nss: '12345678901', fechaNacimiento: '1990-05-20' })
    const luis = store.crearEmpleado({ nombre: 'Luis', apellidos: 'Pérez', ...base })
    store.crearAumento({ empleadoId: luis.id, fecha: '2022-01-01', salarioNuevo: 22000 })
    store.darDeBaja(luis.id, { fecha: '2023-07-15', motivo: 'FIN_CONTRATO', comentario: 'Proyecto concluido' })
    return luis
  }

  it('la lista muestra Activos por omisión y filtra Ex empleados y Todos, combinable con la búsqueda', async () => {
    altaConBaja()
    const { user } = renderApp()
    const nombres = () => within(screen.getByRole('table')).getAllByRole('link', { name: /^(Ana|Luis)/ }).map((l) => l.textContent)
    expect(screen.getByRole('radio', { name: 'Activos (1)' })).toBeChecked()
    expect(nombres()).toEqual(['Ana López'])

    await user.click(screen.getByRole('radio', { name: 'Ex empleados (1)' }))
    expect(nombres()).toEqual(['Luis Pérez'])
    const fila = screen.getByRole('link', { name: 'Luis Pérez' }).closest('tr')!
    expect(within(fila).getByText('Ex empleado')).toBeInTheDocument()
    expect(within(fila).getByText('2 años 6 meses')).toBeInTheDocument()
    expect(within(fila).getByRole('link', { name: 'Ver a Luis Pérez' })).toBeInTheDocument()
    expect(within(fila).queryByRole('link', { name: /Editar|Dar de baja/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Todos (2)' }))
    await user.type(screen.getByLabelText('Buscar por nombre'), 'luis')
    expect(nombres()).toEqual(['Luis Pérez'])
  })

  it('el detalle es de solo consulta: muestra la baja e historial, sin editar, registrar ni vacaciones', async () => {
    const luis = altaConBaja()
    renderApp(`/empleados/${luis.id}`)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Luis Pérez Ex empleado')
    expect(screen.getByText(/Dado de baja el 15\/07\/2023/).parentElement).toHaveTextContent(
      'Motivo: Término de contrato · Proyecto concluido',
    )
    expect(screen.getByText('Antigüedad al darse de baja').nextSibling).toHaveTextContent('2 años 6 meses')
    expect(screen.getByText('Último salario').nextSibling).toHaveTextContent('$22,000.00')
    expect(screen.getByRole('table', { name: 'Historial salarial' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Editar|Dar de baja/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Vacaciones' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Datos incompletos/)).not.toBeInTheDocument()
  })

  it('no se puede editar ni volver a dar de baja desde la URL', () => {
    const luis = altaConBaja()
    const { unmount } = renderApp(`/empleados/${luis.id}/editar`)
    expect(screen.getByText(/es ex empleado \(baja el 15\/07\/2023\)/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument()
    unmount()
    renderApp(`/empleados/${luis.id}/baja`)
    expect(screen.getByText(/Ya fue dado de baja el 15\/07\/2023/)).toBeInTheDocument()
  })
})

describe('empleados que rebasan 100 años (R7)', () => {
  it('muestran "Supera 100 años" y al editarlos no se guardan hasta corregir la fecha', async () => {
    store.crearEmpleado({
      nombre: 'Luis', apellidos: 'Pérez', puesto: 'Dev', departamento: 'TI',
      fechaNacimiento: '1900-01-01', nss: '98765432109', fechaIngreso: '1925-01-01', salarioInicial: 12000,
    })
    const { user } = renderApp()
    expect(screen.getByText('Supera 100 años')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Luis Pérez' }))
    expect(screen.getByText(/tiene \d+ años de edad y \d+ años de antigüedad; el máximo es 100/)).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Corregir datos' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByLabelText(/^Fecha de nacimiento/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/^Fecha de ingreso/)).toHaveAttribute('aria-invalid', 'true')

    const nacimiento = screen.getByLabelText(/^Fecha de nacimiento/)
    await user.clear(nacimiento)
    await user.type(nacimiento, '1990-05-20')
    const ingreso = screen.getByLabelText(/^Fecha de ingreso/)
    await user.clear(ingreso)
    await user.type(ingreso, '2021-01-01')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByRole('heading', { name: 'Luis Pérez' })).toBeInTheDocument()
    expect(screen.queryByText(/Supera 100 años/)).not.toBeInTheDocument()
  })
})

describe('empleados de ejemplo (A7)', () => {
  it('se muestran con la etiqueta "Ejemplo" y se pueden editar y dar de baja', async () => {
    localStorage.setItem('app-rh:datos:v1', JSON.stringify(EJEMPLOS))
    store.recargar()
    const { user } = renderApp()
    expect(screen.getAllByText('Ejemplo')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Editar a María Fernanda González Ruiz' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dar de baja a María Fernanda González Ruiz' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'María Fernanda González Ruiz' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('María Fernanda González Ruiz Ejemplo')
  })
})
