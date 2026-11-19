import { useState, type ChangeEvent, type FormEvent } from 'react'
import { store } from '../data/store'
import { formatearFecha } from '../domain/fechas'
import {
  diasPermiso,
  ETIQUETA_TIPO_PERMISO,
  permisosDe,
  validarPermiso,
  type CampoPermiso,
  type FormPermiso,
} from '../domain/permiso'
import type { Empleado, Errores, Permiso, TipoPermiso } from '../domain/tipos'
import { Campo } from './Campo'

type Props = { empleado: Empleado; permisos: Permiso[] }

const formInicial: FormPermiso = { tipo: '', fechaInicio: '', fechaFin: '', motivo: '' }
const TIPOS = Object.keys(ETIQUETA_TIPO_PERMISO) as TipoPermiso[]

export function SeccionPermisos({ empleado, permisos }: Props) {
  const [form, setForm] = useState(formInicial)
  const [errores, setErrores] = useState<Errores<CampoPermiso>>({})
  const [aviso, setAviso] = useState('')
  const historial = permisosDe(empleado.id, permisos)

  const props = (campo: Exclude<CampoPermiso, 'tipo'>) => ({
    id: `permiso-${campo}`,
    value: form[campo],
    error: errores[campo],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [campo]: e.target.value })),
  })

  function registrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nuevosErrores = validarPermiso(form, empleado.fechaIngreso)
    setErrores(nuevosErrores)
    const primero = Object.keys(nuevosErrores)[0]
    if (primero || form.tipo === '') {
      setAviso('')
      const foco = primero === 'tipo' ? `permiso-tipo-${TIPOS[0]}` : `permiso-${primero}`
      document.getElementById(foco)?.focus()
      return
    }
    const motivo = form.motivo.trim()
    store.crearPermiso({
      empleadoId: empleado.id,
      tipo: form.tipo,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      ...(motivo && { motivo }),
    })
    setForm(formInicial)
    setAviso(`Permiso ${ETIQUETA_TIPO_PERMISO[form.tipo].toLowerCase()} registrado.`)
  }

  return (
    <section aria-labelledby="titulo-permisos" className="seccion">
      <h2 id="titulo-permisos">Permisos</h2>

      <form noValidate onSubmit={registrar} className="formulario formulario--linea" aria-label="Registrar permiso">
        <fieldset
          className={`campo grupo-opciones${errores.tipo ? ' campo--error' : ''}`}
          aria-describedby={errores.tipo ? 'permiso-tipo-error' : undefined}
        >
          <legend>
            Tipo de permiso<span aria-hidden="true"> *</span>
          </legend>
          {TIPOS.map((tipo) => (
            <label key={tipo} className="opcion">
              <input
                type="radio"
                id={`permiso-tipo-${tipo}`}
                name="permiso-tipo"
                value={tipo}
                checked={form.tipo === tipo}
                aria-invalid={errores.tipo ? true : undefined}
                onChange={() => setForm((f) => ({ ...f, tipo }))}
              />
              {ETIQUETA_TIPO_PERMISO[tipo]}
            </label>
          ))}
          {errores.tipo && (
            <p id="permiso-tipo-error" className="campo-error">
              {errores.tipo}
            </p>
          )}
        </fieldset>
        <Campo {...props('fechaInicio')} etiqueta="Fecha de inicio" obligatorio type="date" min={empleado.fechaIngreso} />
        <Campo {...props('fechaFin')} etiqueta="Fecha de fin" obligatorio type="date" min={form.fechaInicio || empleado.fechaIngreso} />
        <Campo {...props('motivo')} etiqueta="Motivo del permiso" />
        <div className="acciones-formulario">
          <button type="submit" className="boton boton--primario">
            Registrar permiso
          </button>
        </div>
      </form>
      <p role="status" className="aviso">
        {aviso}
      </p>

      {historial.length === 0 ? (
        <p className="vacio">Sin permisos registrados.</p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <caption className="sr-only">Historial de permisos</caption>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Inicio</th>
                <th scope="col">Fin</th>
                <th scope="col">Días</th>
                <th scope="col">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className={`etiqueta etiqueta--${p.tipo === 'CON_GOCE' ? 'con-goce' : 'sin-goce'}`}>
                      {ETIQUETA_TIPO_PERMISO[p.tipo]}
                    </span>
                  </td>
                  <td>{formatearFecha(p.fechaInicio)}</td>
                  <td>{formatearFecha(p.fechaFin)}</td>
                  <td>{diasPermiso(p)}</td>
                  <td>{p.motivo ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
