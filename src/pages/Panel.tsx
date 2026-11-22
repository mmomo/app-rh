import { Link } from 'react-router-dom'
import { CLASE_TIPO } from '../components/clasesPermiso'
import { GraficaPlantilla } from '../components/GraficaPlantilla'
import { useEstado } from '../data/store'
import { nombreCompleto } from '../domain/empleado'
import { formatearFecha, hoyISO } from '../domain/fechas'
import { formatearMoneda } from '../domain/formato'
import {
  ausentesEn,
  evolucionPlantilla,
  mesDe,
  nombreMes,
  nominaEn,
  nominaPorDepartamento,
  permisosDelMes,
  sumarMeses,
  ultimoDia,
} from '../domain/panel'
import { ETIQUETA_TIPO_PERMISO } from '../domain/permiso'
import type { TipoPermiso } from '../domain/tipos'

const porcentaje = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 })

const RESUMEN_TIPO: Record<TipoPermiso, string> = {
  CON_GOCE: 'con goce de sueldo',
  SIN_GOCE: 'sin goce de sueldo',
  VACACIONES: 'de vacaciones',
}

function conSigno(valor: number, texto: string): string {
  return valor > 0 ? `+${texto}` : valor < 0 ? `−${texto}` : texto
}

function plural(n: number, singular: string, pluralTexto = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`
}

/** A9: panel de resumen de RH (página de inicio). */
export function Panel() {
  const { empleados, aumentos, permisos } = useEstado()
  const hoy = hoyISO()
  const mes = mesDe(hoy)
  const mesAnterior = sumarMeses(mes, -1)
  const cierreAnterior = ultimoDia(mesAnterior)

  const evolucion = evolucionPlantilla(empleados, hoy)
  const actual = evolucion.at(-1)!
  const anterior = evolucion.at(-2)!
  const variacionPlantilla = actual.activos - anterior.activos

  const nomina = nominaEn(empleados, aumentos, hoy)
  const nominaAnterior = nominaEn(empleados, aumentos, cierreAnterior)
  const variacionNomina = nomina - nominaAnterior
  const departamentos = nominaPorDepartamento(empleados, aumentos, hoy)

  const ausentes = ausentesEn(empleados, permisos, hoy)
  const delMes = permisosDelMes(permisos, empleados, mes)
  const tipos = Object.keys(ETIQUETA_TIPO_PERMISO) as TipoPermiso[]
  const vsAnterior = `vs. ${nombreMes(mesAnterior)}`

  return (
    <section>
      <h1>Panel de RH</h1>
      <p className="nota">Datos al {formatearFecha(hoy)}.</p>

      <dl className="tarjetas">
        <div className="tarjeta">
          <dt>Plantilla activa</dt>
          <dd className="tarjeta-valor">{actual.activos}</dd>
          <dd className="tarjeta-detalle">
            {variacionPlantilla === 0 ? `Sin cambio ${vsAnterior}` : `${conSigno(variacionPlantilla, String(Math.abs(variacionPlantilla)))} ${vsAnterior}`}
          </dd>
        </div>
        <div className="tarjeta">
          <dt>Nómina mensual vigente</dt>
          <dd className="tarjeta-valor">{formatearMoneda(nomina)}</dd>
          <dd className="tarjeta-detalle">
            {variacionNomina === 0
              ? `Sin cambio ${vsAnterior}`
              : `${conSigno(variacionNomina, formatearMoneda(Math.abs(variacionNomina)))}${
                  nominaAnterior > 0 ? ` (${conSigno(variacionNomina, `${porcentaje.format(Math.abs(variacionNomina / nominaAnterior) * 100)} %`)})` : ''
                } ${vsAnterior}`}
          </dd>
        </div>
        <div className="tarjeta">
          <dt>Ausentes hoy</dt>
          <dd className="tarjeta-valor">{ausentes.length}</dd>
          <dd className="tarjeta-detalle">de {plural(actual.activos, 'activo')}</dd>
        </div>
      </dl>

      <section aria-labelledby="titulo-plantilla" className="seccion">
        <h2 id="titulo-plantilla">Plantilla activa</h2>
        <p>
          En {nombreMes(mes)}: <strong>{plural(actual.altas, 'alta')}</strong> y <strong>{plural(actual.bajas, 'baja')}</strong>.
        </p>
        <h3>Evolución de los últimos 12 meses</h3>
        <div className="grafica-contenedor">
          <GraficaPlantilla meses={evolucion} />
        </div>
        <div className="tabla-contenedor">
          <table>
            <caption className="sr-only">Activos, altas y bajas por mes</caption>
            <thead>
              <tr>
                <th scope="col">Mes</th>
                <th scope="col" className="numero">Activos al cierre</th>
                <th scope="col" className="numero">Altas</th>
                <th scope="col" className="numero">Bajas</th>
              </tr>
            </thead>
            <tbody>
              {[...evolucion].reverse().map((m) => (
                <tr key={m.mes}>
                  <th scope="row">
                    {nombreMes(m.mes, true)}
                    {m === actual && <span className="nota"> (al {formatearFecha(hoy)})</span>}
                  </th>
                  <td className="numero">{m.activos}</td>
                  <td className="numero">{m.altas}</td>
                  <td className="numero">{m.bajas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="titulo-nomina" className="seccion">
        <h2 id="titulo-nomina">Nómina mensual vigente</h2>
        <p>
          Total <strong>{formatearMoneda(nomina)}</strong>
          {actual.activos > 0 && (
            <>
              {' '}· salario promedio <strong>{formatearMoneda(nomina / actual.activos)}</strong>
            </>
          )}
          {' '}· al cierre de {nombreMes(mesAnterior)}: {formatearMoneda(nominaAnterior)}.
        </p>
        {departamentos.length === 0 ? (
          <p className="vacio">No hay empleados activos.</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla--compacta">
              <caption className="sr-only">Nómina por departamento</caption>
              <thead>
                <tr>
                  <th scope="col">Departamento</th>
                  <th scope="col" className="numero">Personas</th>
                  <th scope="col" className="numero">Nómina</th>
                  <th scope="col">% del total</th>
                </tr>
              </thead>
              <tbody>
                {departamentos.map((d) => (
                  <tr key={d.departamento}>
                    <th scope="row">{d.departamento}</th>
                    <td className="numero">{d.personas}</td>
                    <td className="numero">{formatearMoneda(d.monto)}</td>
                    <td>
                      <div className="proporcion">
                        <span className="proporcion-pista" aria-hidden="true">
                          <span className="proporcion-barra" style={{ width: `${d.porcentaje}%` }} />
                        </span>
                        <span>{porcentaje.format(d.porcentaje)} %</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="titulo-ausencias" className="seccion">
        <h2 id="titulo-ausencias">Ausencias</h2>
        <h3>Ausentes hoy</h3>
        {ausentes.length === 0 ? (
          <p className="vacio">Nadie está ausente hoy.</p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <caption className="sr-only">Empleados ausentes hoy</caption>
              <thead>
                <tr>
                  <th scope="col">Empleado</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Ausente hasta</th>
                </tr>
              </thead>
              <tbody>
                {ausentes.map(({ empleado, permiso }) => (
                  <tr key={permiso.id}>
                    <td>
                      <Link to={`/empleados/${empleado.id}`}>{nombreCompleto(empleado)}</Link>
                    </td>
                    <td>
                      <span className={`etiqueta ${CLASE_TIPO[permiso.tipo]}`}>{ETIQUETA_TIPO_PERMISO[permiso.tipo]}</span>
                    </td>
                    <td>{formatearFecha(permiso.fechaFin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h3>Permisos de {nombreMes(mes, true)}</h3>
        {delMes.permisos.length === 0 ? (
          <p className="vacio">No hay permisos este mes.</p>
        ) : (
          <>
            <p>
              {plural(delMes.permisos.length, 'permiso')} de {plural(delMes.personas, 'persona')}:{' '}
              {tipos.map((t) => `${delMes.porTipo[t]} ${RESUMEN_TIPO[t]}`).join(' · ')}.
            </p>
            <div className="tabla-contenedor">
              <table>
                <caption className="sr-only">Permisos del mes</caption>
                <thead>
                  <tr>
                    <th scope="col">Empleado</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Inicio</th>
                    <th scope="col">Fin</th>
                    <th scope="col" className="numero">Días en el mes</th>
                  </tr>
                </thead>
                <tbody>
                  {delMes.permisos.map(({ permiso, empleado, diasEnMes }) => (
                    <tr key={permiso.id}>
                      <td>
                        {empleado ? <Link to={`/empleados/${empleado.id}`}>{nombreCompleto(empleado)}</Link> : '—'}
                        {empleado?.baja && <> <span className="etiqueta etiqueta--ex">Ex empleado</span></>}
                      </td>
                      <td>
                        <span className={`etiqueta ${CLASE_TIPO[permiso.tipo]}`}>{ETIQUETA_TIPO_PERMISO[permiso.tipo]}</span>
                      </td>
                      <td>{formatearFecha(permiso.fechaInicio)}</td>
                      <td>{formatearFecha(permiso.fechaFin)}</td>
                      <td className="numero">
                        {diasEnMes}
                        {permiso.tipo === 'VACACIONES' && <span className="nota"> laborables</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </section>
  )
}
