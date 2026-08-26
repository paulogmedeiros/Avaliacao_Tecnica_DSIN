import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'
export function ProtectedRoute() { return useAuthStore((state) => state.accessToken) ? <Outlet /> : <Navigate to="/login" replace /> }
export function RoleRoute({ role }: { role: 'CLIENT' | 'ADMIN' }) { const user = useAuthStore((state) => state.user); if (!user) return <Navigate to="/login" replace />; if (user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/cliente/agendamentos'} replace />; return <Outlet /> }
