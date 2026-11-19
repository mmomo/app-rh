import { Navigate, Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <>
      <header className="app-header">
        <p className="app-title">Control de RR. HH.</p>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/empleados" replace />} />
          <Route path="/empleados" element={<h1>Empleados</h1>} />
        </Routes>
      </main>
    </>
  )
}
