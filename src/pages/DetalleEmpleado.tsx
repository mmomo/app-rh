import { Link, useParams } from 'react-router-dom'
import { SeccionAumentos } from '../components/SeccionAumentos'
import { SeccionPermisos } from '../components/SeccionPermisos'
import { SeccionVacaciones } from '../components/SeccionVacaciones'
import { esEjemplo } from '../data/ejemplos'
import { useEstado } from '../data/store'
import { formatearAntiguedad } from '../domain/antiguedad'
import { antiguedadDe, ETIQUETA_MOTIVO_BAJA } from '../domain/baja'
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
  const { baja } = empleado
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
          {baja && <> <span className="etiqueta etiqueta--ex">Ex empleado</span></>}
        </h1>
        {!baja && (
          <div className="acciones">
            <Link className="boton" to={`/empleados/${empleado.id}/editar`}>
              Editar
            </Link>
            <Link className="boton boton--peligro" to={`/empleados/${empleado.id}/baja`}>
              Dar de baja
            </Link>
          </div>
        )}
      </div>

      {baja && (
        <p className="baja">
          <strong>Dado de baja el {formatearFecha(baja.fecha)}</strong> · Motivo: {ETIQUETA_MOTIVO_BAJA[baja.motivo]}
          {baja.comentario && <> · {baja.comentario}</>}. Expediente de solo consulta.
        </p>
      )}

      {!baja && datosIncompletos(empleado) && (
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
        <dt>{baja ? 'Antigüedad al darse de baja' : 'Antigüedad'}</dt>
        <dd>{formatearAntiguedad(antiguedadDe(empleado))}</dd>
        <dt>{baja ? 'Último salario' : 'Salario vigente'}</dt>
        <dd className="destacado">{formatearMoneda(salarioVigente(empleado, aumentos))}</dd>
        <dt>Correo electrónico</dt>
        <dd>{empleado.email ?? '—'}</dd>
        <dt>Teléfono</dt>
        <dd>{empleado.telefono ?? '—'}</dd>
      </dl>

      {!baja && <SeccionVacaciones empleado={empleado} permisos={permisos} />}
      <SeccionAumentos empleado={empleado} aumentos={aumentos} soloConsulta={!!baja} />
      <SeccionPermisos empleado={empleado} permisos={permisos} soloConsulta={!!baja} />
    </section>
  )
}
