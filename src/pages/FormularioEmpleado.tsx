import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Campo } from '../components/Campo'
import { store, useEstado } from '../data/store'
import {
  datosDesdeForm,
  formDesdeEmpleado,
  formVacio,
  validarEmpleado,
  type CampoEmpleado,
  type FormEmpleado,
} from '../domain/empleado'
import type { Errores } from '../domain/tipos'
import { NoEncontrado } from './NoEncontrado'

export function FormularioEmpleado() {
  const { id } = useParams()
  const { empleados } = useEstado()
  const existente = id ? empleados.find((e) => e.id === id) : undefined

  if (id && !existente) return <NoEncontrado />
  return <Formulario key={id ?? 'nuevo'} id={id} inicial={existente ? formDesdeEmpleado(existente) : formVacio} />
}

function Formulario({ id, inicial }: { id?: string; inicial: FormEmpleado }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(inicial)
  const [errores, setErrores] = useState<Errores<CampoEmpleado>>({})

  const props = (campo: CampoEmpleado) => ({
    id: campo,
    value: form[campo],
    error: errores[campo],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [campo]: e.target.value })),
  })

  function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nuevosErrores = validarEmpleado(form)
    setErrores(nuevosErrores)
    const primero = Object.keys(nuevosErrores)[0]
    if (primero) {
      document.getElementById(primero)?.focus()
      return
    }
    const datos = datosDesdeForm(form)
    if (id) {
      store.actualizarEmpleado(id, datos)
      navigate(`/empleados/${id}`)
    } else {
      const nuevo = store.crearEmpleado(datos)
      navigate(`/empleados/${nuevo.id}`)
    }
  }

  return (
    <section>
      <h1>{id ? 'Editar empleado' : 'Nuevo empleado'}</h1>
      <p className="nota">Los campos marcados con * son obligatorios.</p>
      <form noValidate onSubmit={guardar} className="formulario">
        <Campo {...props('nombre')} etiqueta="Nombre" obligatorio autoComplete="given-name" />
        <Campo {...props('apellidos')} etiqueta="Apellidos" obligatorio autoComplete="family-name" />
        <Campo {...props('puesto')} etiqueta="Puesto" obligatorio />
        <Campo {...props('departamento')} etiqueta="Departamento" obligatorio />
        <Campo {...props('fechaIngreso')} etiqueta="Fecha de ingreso" obligatorio type="date" />
        <Campo
          {...props('salarioInicial')}
          etiqueta="Salario inicial (MXN)"
          obligatorio
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
        />
        <Campo {...props('email')} etiqueta="Correo electrónico" type="email" autoComplete="email" />
        <Campo {...props('telefono')} etiqueta="Teléfono" type="tel" autoComplete="tel" />
        <div className="acciones-formulario">
          <button type="submit" className="boton boton--primario">
            Guardar
          </button>
          <Link className="boton" to={id ? `/empleados/${id}` : '/empleados'}>
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  )
}
