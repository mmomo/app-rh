import { Link, useParams } from 'react-router-dom'
import { SeccionAumentos } from '../components/SeccionAumentos'
import { SeccionPermisos } from '../components/SeccionPermisos'
import { SeccionVacaciones } from '../components/SeccionVacaciones'
import { esEjemplo } from '../data/ejemplos'
import { useEstado } from '../data/store'
import { calcularAntiguedad, formatearAntiguedad } from '../domain/antiguedad'
import { calcularEdad, datosIncompletos, EDAD_MAXIMA, excesoDeAnios, nombreCompleto } from '../domain/empleado'
import { formatearFecha } from '../domain/fechas'
import { formatearMoneda } from '../domain/formato'
import { salarioVigente } from '../domain/salario'
import { NoEncontrado } from './NoEncontrado'

export function DetalleEmpleado() {
  const { id } = useParams()
  const { empleados, aumentos, permisos } = useEstado()
  const empleado = empleados.find((e) => e.id === id)

  if (!empleado) return <NoEncontrado />
  const nombre = nombreCompleto(empleado)
  const exceso = excesoDeAnios(empleado)
  const excesos = [
    exceso.edad && `${exceso.edad} años de edad`,
    exceso.antiguedad && `${exceso.antiguedad} años de antigüedad`,
  ].filter(Boolean)

  return (
    <section>
      <p>
        <Link to="/empleados">← Volver a la lista</Link>
      </p>
      <div className="encabezado">
        <h1>
          {nombre}
          {esEjemplo(empleado.id) && <> <span className="etiqueta">Ejemplo</span></>}
        </h1>
        <div className="acciones">
          <Link className="boton" to={`/empleados/${empleado.id}/editar`}>
            Editar
          </Link>
          <Link className="boton boton--peligro" to={`/empleados/${empleado.id}/baja`}>
            Dar de baja
          </Link>
        </div>
      </div>

      {datosIncompletos(empleado) && (
        <p className="alerta">
          <strong>Datos incompletos:</strong> falta registrar el NSS o la fecha de nacimiento.{' '}
          <Link to={`/empleados/${empleado.id}/editar`}>Completar datos</Link>
        </p>
      )}

      {excesos.length > 0 && (
        <p className="alerta">
          <strong>Supera {EDAD_MAXIMA} años:</strong> tiene {excesos.join(' y ')}; el máximo es {EDAD_MAXIMA}. Revisa las fechas.{' '}
          <Link to={`/empleados/${empleado.id}/editar`}>Corregir datos</Link>
        </p>
      )}

      <dl className="ficha">
        <dt>NSS</dt>
        <dd>{empleado.nss ?? '—'}</dd>
        <dt>Fecha de nacimiento</dt>
        <dd>
          {empleado.fechaNacimiento
            ? `${formatearFecha(empleado.fechaNacimiento)} (${calcularEdad(empleado.fechaNacimiento)} años)`
            : '—'}
        </dd>
        <dt>Puesto</dt>
        <dd>{empleado.puesto}</dd>
        <dt>Departamento</dt>
        <dd>{empleado.departamento}</dd>
        <dt>Fecha de ingreso</dt>
        <dd>{formatearFecha(empleado.fechaIngreso)}</dd>
        <dt>Antigüedad</dt>
        <dd>{formatearAntiguedad(calcularAntiguedad(empleado.fechaIngreso))}</dd>
        <dt>Salario vigente</dt>
        <dd className="destacado">{formatearMoneda(salarioVigente(empleado, aumentos))}</dd>
        <dt>Correo electrónico</dt>
        <dd>{empleado.email ?? '—'}</dd>
        <dt>Teléfono</dt>
        <dd>{empleado.telefono ?? '—'}</dd>
      </dl>

      <SeccionVacaciones empleado={empleado} permisos={permisos} />
      <SeccionAumentos empleado={empleado} aumentos={aumentos} />
      <SeccionPermisos empleado={empleado} permisos={permisos} />
    </section>
  )
}
