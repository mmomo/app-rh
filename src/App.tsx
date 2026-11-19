import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { DetalleEmpleado } from './pages/DetalleEmpleado'
import { FormularioEmpleado } from './pages/FormularioEmpleado'
import { ListaEmpleados } from './pages/ListaEmpleados'

export default function App() {
  return (
    <>
      <header className="app-header">
        <Link className="app-title" to="/empleados">
          Control de RR. HH.
        </Link>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/empleados" replace />} />
          <Route path="/empleados" element={<ListaEmpleados />} />
          <Route path="/empleados/nuevo" element={<FormularioEmpleado />} />
          <Route path="/empleados/:id" element={<DetalleEmpleado />} />
          <Route path="/empleados/:id/editar" element={<FormularioEmpleado />} />
          <Route path="*" element={<Navigate to="/empleados" replace />} />
        </Routes>
      </main>
    </>
  )
}
