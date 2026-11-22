import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { DetalleEmpleado } from './pages/DetalleEmpleado'
import { FormularioBaja } from './pages/FormularioBaja'
import { FormularioEmpleado } from './pages/FormularioEmpleado'
import { ListaEmpleados } from './pages/ListaEmpleados'
import { Panel } from './pages/Panel'

export default function App() {
  return (
    <>
      <header className="app-header">
        <Link className="app-title" to="/panel">
          Control de RR. HH.
        </Link>
        <nav aria-label="Principal">
          <ul className="menu">
            <li>
              <NavLink to="/panel">Panel</NavLink>
            </li>
            <li>
              <NavLink to="/empleados">Empleados</NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/panel" replace />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/empleados" element={<ListaEmpleados />} />
          <Route path="/empleados/nuevo" element={<FormularioEmpleado />} />
          <Route path="/empleados/:id" element={<DetalleEmpleado />} />
          <Route path="/empleados/:id/editar" element={<FormularioEmpleado />} />
          <Route path="/empleados/:id/baja" element={<FormularioBaja />} />
          <Route path="*" element={<Navigate to="/panel" replace />} />
        </Routes>
      </main>
    </>
  )
}
