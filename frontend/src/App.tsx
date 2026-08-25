import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminAppointmentsPage } from './pages/AdminAppointmentsPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/cliente/agendamentos" element={<AppointmentsPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="agendamentos" element={<AdminAppointmentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
