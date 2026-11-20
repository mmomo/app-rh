import { useState } from 'react'
import { Link } from 'react-router-dom'
import { esEjemplo } from '../data/ejemplos'
import { store, useEstado } from '../data/store'
import { calcularAntiguedad, formatearAntiguedad } from '../domain/antiguedad'
import { datosIncompletos, nombreCompleto, superaLimiteAnios } from '../domain/empleado'
import { formatearMoneda } from '../domain/formato'
import type { Empleado } from '../domain/tipos'
import { salarioVigente } from '../domain/salario'
import { saldoVacaciones } from '../domain/vacaciones'

export function ListaEmpleados() {
  const { empleados, aumentos, permisos } = useEstado()
  const [busqueda, setBusqueda] = useState('')

  const termino = busqueda.trim().toLowerCase()
  const visibles = empleados
    .filter((e) => nombreCompleto(e).toLowerCase().includes(termino))
    .sort((a, b) => nombreCompleto(a).localeCompare(nombreCompleto(b), 'es'))

  function textoVacaciones(e: Empleado) {
    const { corresponden, restantes } = saldoVacaciones(e, permisos)
    return corresponden === 0 ? 'Sin derecho aún' : `${restantes} de ${corresponden}`
  }

  function eliminar(id: string, nombre: string) {
    if (window.confirm(`¿Eliminar a ${nombre}? Se borrará también su historial.`)) {
      store.eliminarEmpleado(id)
    }
  }

  return (
    <section>
      <div className="encabezado">
        <h1>Empleados</h1>
        <Link className="boton boton--primario" to="/empleados/nuevo">
          Nuevo empleado
        </Link>
      </div>

      <div className="campo campo--busqueda">
        <label htmlFor="busqueda">Buscar por nombre</label>
        <input id="busqueda" type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      {empleados.length === 0 ? (
        <p className="vacio">Aún no hay empleados registrados.</p>
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
                return (
                  <tr key={e.id}>
                    <td>
                      <Link to={`/empleados/${e.id}`}>{nombre}</Link>
                      {esEjemplo(e.id) && <> <span className="etiqueta">Ejemplo</span></>}
                      {datosIncompletos(e) && <> <span className="etiqueta etiqueta--aviso">Datos incompletos</span></>}
                      {superaLimiteAnios(e) && <> <span className="etiqueta etiqueta--aviso">Supera 100 años</span></>}
                    </td>
                    <td>{e.puesto}</td>
                    <td>{e.departamento}</td>
                    <td>{formatearAntiguedad(calcularAntiguedad(e.fechaIngreso))}</td>
                    <td>{formatearMoneda(salarioVigente(e, aumentos))}</td>
                    <td>{textoVacaciones(e)}</td>
                    <td>
                      <div className="acciones">
                        <Link className="boton" to={`/empleados/${e.id}/editar`} aria-label={`Editar a ${nombre}`}>
                          Editar
                        </Link>
                        {!esEjemplo(e.id) && (
                          <button
                            type="button"
                            className="boton boton--peligro"
                            onClick={() => eliminar(e.id, nombre)}
                            aria-label={`Eliminar a ${nombre}`}
                          >
                            Eliminar
                          </button>
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
