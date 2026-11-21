import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Campo } from '../components/Campo'
import { store, useEstado } from '../data/store'
import {
  bajaDesdeForm,
  ETIQUETA_MOTIVO_BAJA,
  fechaUltimoMovimiento,
  validarBaja,
  type CampoBaja,
  type FormBaja,
} from '../domain/baja'
import { nombreCompleto } from '../domain/empleado'
import { formatearFecha, hoyISO } from '../domain/fechas'
import type { Errores, MotivoBaja } from '../domain/tipos'
import { NoEncontrado } from './NoEncontrado'

const MOTIVOS = Object.keys(ETIQUETA_MOTIVO_BAJA) as MotivoBaja[]
const formInicial: FormBaja = { fecha: '', motivo: '', comentario: '' }

/** A8: dar de baja a un empleado (definitivo); su registro queda como ex empleado. */
export function FormularioBaja() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { empleados, permisos, aumentos } = useEstado()
  const empleado = empleados.find((e) => e.id === id)
  const [form, setForm] = useState(formInicial)
  const [errores, setErrores] = useState<Errores<CampoBaja>>({})

  if (!empleado) return <NoEncontrado />
  const nombre = nombreCompleto(empleado)

  if (empleado.baja) {
    return (
      <section>
        <h1>Dar de baja a {nombre}</h1>
        <p>
          Ya fue dado de baja el {formatearFecha(empleado.baja.fecha)}.{' '}
          <Link to={`/empleados/${empleado.id}`}>Ver expediente</Link>
        </p>
      </section>
    )
  }

  const ultimo = fechaUltimoMovimiento(empleado.id, permisos, aumentos)
  const minimo = ultimo && ultimo > empleado.fechaIngreso ? ultimo : empleado.fechaIngreso

  function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nuevosErrores = validarBaja(form, empleado!, permisos, aumentos)
    setErrores(nuevosErrores)
    if (nuevosErrores.fecha) return document.getElementById('baja-fecha')?.focus()
    if (nuevosErrores.motivo) return document.getElementById(`baja-motivo-${MOTIVOS[0]}`)?.focus()
    store.darDeBaja(empleado!.id, bajaDesdeForm(form))
    navigate(`/empleados/${empleado!.id}`)
  }

  return (
    <section>
      <p>
        <Link to={`/empleados/${empleado.id}`}>← Volver al expediente</Link>
      </p>
      <h1>Dar de baja a {nombre}</h1>
      <p className="alerta">
        <strong>La baja es definitiva.</strong> El expediente se conserva como ex empleado y se puede consultar, pero ya
        no se podrá editar ni registrar permisos, aumentos o vacaciones.
      </p>
      <p className="nota">Los campos marcados con * son obligatorios.</p>
      <form noValidate onSubmit={guardar} className="formulario">
        <Campo
          id="baja-fecha"
          etiqueta="Fecha de baja"
          obligatorio
          type="date"
          min={minimo}
          max={hoyISO()}
          value={form.fecha}
          error={errores.fecha}
          onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
          ayuda={
            ultimo
              ? `Entre el ${formatearFecha(minimo)} (último permiso o aumento) y hoy.`
              : `Entre el ${formatearFecha(minimo)} (ingreso) y hoy.`
          }
        />
        <fieldset
          className={`campo grupo-opciones${errores.motivo ? ' campo--error' : ''}`}
          aria-describedby={errores.motivo ? 'baja-motivo-error' : undefined}
        >
          <legend>
            Motivo de la baja<span aria-hidden="true"> *</span>
          </legend>
          {MOTIVOS.map((motivo) => (
            <label key={motivo} className="opcion">
              <input
                type="radio"
                id={`baja-motivo-${motivo}`}
                name="baja-motivo"
                value={motivo}
                checked={form.motivo === motivo}
                aria-invalid={errores.motivo ? true : undefined}
                onChange={() => setForm((f) => ({ ...f, motivo }))}
              />
              {ETIQUETA_MOTIVO_BAJA[motivo]}
            </label>
          ))}
          {errores.motivo && (
            <p id="baja-motivo-error" className="campo-error">
              {errores.motivo}
            </p>
          )}
        </fieldset>
        <Campo
          id="baja-comentario"
          etiqueta="Comentario"
          value={form.comentario}
          onChange={(e) => setForm((f) => ({ ...f, comentario: e.target.value }))}
        />
        <div className="acciones-formulario">
          <button type="submit" className="boton boton--peligro">
            Confirmar baja
          </button>
          <Link className="boton" to={`/empleados/${empleado.id}`}>
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  )
}
