import { useState } from 'react'
import { Link } from 'react-router-dom'
import { esEjemplo } from '../data/ejemplos'
import { useEstado } from '../data/store'
import { formatearAntiguedad } from '../domain/antiguedad'
import { antiguedadDe, esActivo } from '../domain/baja'
import { datosIncompletos, nombreCompleto, superaLimiteAnios } from '../domain/empleado'
import { formatearMoneda } from '../domain/formato'
import type { Empleado } from '../domain/tipos'
import { salarioVigente } from '../domain/salario'
import { saldoVacaciones } from '../domain/vacaciones'

type Filtro = 'ACTIVOS' | 'EX' | 'TODOS'

/** A8: por omisión se muestran solo los empleados activos. */
const FILTROS: Record<Filtro, { etiqueta: string; vacio: string; incluye: (e: Empleado) => boolean }> = {
  ACTIVOS: { etiqueta: 'Activos', vacio: 'No hay empleados activos.', incluye: esActivo },
  EX: { etiqueta: 'Ex empleados', vacio: 'No hay ex empleados.', incluye: (e) => !esActivo(e) },
  TODOS: { etiqueta: 'Todos', vacio: '', incluye: () => true },
}

export function ListaEmpleados() {
  const { empleados, aumentos, permisos } = useEstado()
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('ACTIVOS')

  const delFiltro = empleados.filter(FILTROS[filtro].incluye)
  const termino = busqueda.trim().toLowerCase()
  const visibles = delFiltro
    .filter((e) => nombreCompleto(e).toLowerCase().includes(termino))
    .sort((a, b) => nombreCompleto(a).localeCompare(nombreCompleto(b), 'es'))

  function textoVacaciones(e: Empleado) {
    if (!esActivo(e)) return '—'
    const { corresponden, restantes } = saldoVacaciones(e, permisos)
    return corresponden === 0 ? 'Sin derecho aún' : `${restantes} de ${corresponden}`
  }

  return (
    <section>
      <div className="encabezado">
        <h1>Empleados</h1>
        <Link className="boton boton--primario" to="/empleados/nuevo">
          Nuevo empleado
        </Link>
      </div>

      <div className="filtros">
        <div className="campo campo--busqueda">
          <label htmlFor="busqueda">Buscar por nombre</label>
          <input id="busqueda" type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <fieldset className="grupo-opciones grupo-opciones--linea">
          <legend>Mostrar</legend>
          {(Object.keys(FILTROS) as Filtro[]).map((f) => (
            <label key={f} className="opcion">
              <input type="radio" name="filtro" value={f} checked={filtro === f} onChange={() => setFiltro(f)} />
              {FILTROS[f].etiqueta} ({empleados.filter(FILTROS[f].incluye).length})
            </label>
          ))}
        </fieldset>
      </div>

      {empleados.length === 0 ? (
        <p className="vacio">Aún no hay empleados registrados.</p>
      ) : delFiltro.length === 0 ? (
        <p className="vacio">{FILTROS[filtro].vacio}</p>
      ) : visibles.length === 0 ? (
        <p className="vacio">Ningún empleado coincide con “{busqueda}”.</p>
      ) : (
        <div className="tabla-contenedor">
          <table>
            <caption className="sr-only">Lista de empleados</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Puesto</th>
                <th scope="col">Departamento</th>
                <th scope="col">Antigüedad</th>
                <th scope="col">Salario vigente</th>
                <th scope="col">Vacaciones restantes</th>
                <th scope="col">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((e) => {
                const nombre = nombreCompleto(e)
                const activo = esActivo(e)
                return (
                  <tr key={e.id}>
                    <td>
                      <Link to={`/empleados/${e.id}`}>{nombre}</Link>
                      {esEjemplo(e.id) && <> <span className="etiqueta">Ejemplo</span></>}
                      {!activo && <> <span className="etiqueta etiqueta--ex">Ex empleado</span></>}
                      {activo && datosIncompletos(e) && <> <span className="etiqueta etiqueta--aviso">Datos incompletos</span></>}
                      {superaLimiteAnios(e) && <> <span className="etiqueta etiqueta--aviso">Supera 100 años</span></>}
                    </td>
                    <td>{e.puesto}</td>
                    <td>{e.departamento}</td>
                    <td>{formatearAntiguedad(antiguedadDe(e))}</td>
                    <td>{formatearMoneda(salarioVigente(e, aumentos))}</td>
                    <td>{textoVacaciones(e)}</td>
                    <td>
                      <div className="acciones">
                        {activo ? (
                          <>
                            <Link className="boton" to={`/empleados/${e.id}/editar`} aria-label={`Editar a ${nombre}`}>
                              Editar
                            </Link>
                            <Link className="boton boton--peligro" to={`/empleados/${e.id}/baja`} aria-label={`Dar de baja a ${nombre}`}>
                              Dar de baja
                            </Link>
                          </>
                        ) : (
                          <Link className="boton" to={`/empleados/${e.id}`} aria-label={`Ver a ${nombre}`}>
                            Ver
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
