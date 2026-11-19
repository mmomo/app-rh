import { Link } from 'react-router-dom'

export function NoEncontrado() {
  return (
    <section>
      <h1>Empleado no encontrado</h1>
      <p>
        El registro no existe o fue eliminado. <Link to="/empleados">Volver a la lista</Link>
      </p>
    </section>
  )
}
