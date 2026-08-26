import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminAppointmentsPage } from './pages/AdminAppointmentsPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminServicesPage } from './pages/AdminServicesPage'
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute role="CLIENT" />}><Route path="/cliente/agendamentos" element={<AppointmentsPage />} /></Route>
        <Route element={<RoleRoute role="ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="agendamentos" element={<AdminAppointmentsPage />} />
            <Route path="servicos" element={<AdminServicesPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
