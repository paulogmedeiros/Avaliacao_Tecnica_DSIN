import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { RegisterPage } from './pages/RegisterPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/cliente/agendamentos" element={<AppointmentsPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
