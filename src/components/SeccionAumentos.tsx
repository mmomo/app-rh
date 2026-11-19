import { useState, type ChangeEvent, type FormEvent } from 'react'
import { store } from '../data/store'
import { formatearFecha, hoyISO } from '../domain/fechas'
import { formatearMoneda } from '../domain/formato'
import { historialSalarial, validarAumento, type CampoAumento, type FormAumento } from '../domain/salario'
import type { Aumento, Empleado, Errores } from '../domain/tipos'
import { Campo } from './Campo'

type Props = { empleado: Empleado; aumentos: Aumento[] }

const formInicial = (): FormAumento => ({ fecha: hoyISO(), salarioNuevo: '', motivo: '' })

export function SeccionAumentos({ empleado, aumentos }: Props) {
  const [form, setForm] = useState(formInicial)
  const [errores, setErrores] = useState<Errores<CampoAumento>>({})
  const [aviso, setAviso] = useState('')
  const historial = historialSalarial(empleado, aumentos)

  const props = (campo: CampoAumento) => ({
    id: `aumento-${campo}`,
    value: form[campo],
    error: errores[campo],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [campo]: e.target.value })),
  })

  function registrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nuevosErrores = validarAumento(form, empleado, aumentos)
    setErrores(nuevosErrores)
    const primero = Object.keys(nuevosErrores)[0]
    if (primero) {
      setAviso('')
      document.getElementById(`aumento-${primero}`)?.focus()
      return
    }
    const motivo = form.motivo.trim()
    store.crearAumento({
      empleadoId: empleado.id,
      fecha: form.fecha,
      salarioNuevo: Number(form.salarioNuevo),
      ...(motivo && { motivo }),
    })
    setForm(formInicial())
    setAviso(`Aumento registrado. Salario vigente: ${formatearMoneda(Number(form.salarioNuevo))}.`)
  }

  return (
    <section aria-labelledby="titulo-aumentos" className="seccion">
      <h2 id="titulo-aumentos">Aumentos salariales</h2>

      <form noValidate onSubmit={registrar} className="formulario formulario--linea" aria-label="Registrar aumento">
        <Campo
          {...props('fecha')}
          etiqueta="Fecha del aumento"
          obligatorio
          type="date"
          min={empleado.fechaIngreso}
          max={hoyISO()}
        />
        <Campo
          {...props('salarioNuevo')}
          etiqueta="Nuevo salario (MXN)"
          obligatorio
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
        />
        <Campo {...props('motivo')} etiqueta="Motivo del aumento" />
        <div className="acciones-formulario">
          <button type="submit" className="boton boton--primario">
            Registrar aumento
          </button>
        </div>
      </form>
      <p role="status" className="aviso">
        {aviso}
      </p>

      <div className="tabla-contenedor">
        <table>
          <caption className="sr-only">Historial salarial</caption>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Concepto</th>
              <th scope="col">Salario</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((m, i) => (
              <tr key={m.id}>
                <td>{formatearFecha(m.fecha)}</td>
                <td>{m.concepto}</td>
                <td>
                  {formatearMoneda(m.salario)}
                  {i === historial.length - 1 && <span className="etiqueta"> Vigente</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
