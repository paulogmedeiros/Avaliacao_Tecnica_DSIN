import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/auth.store'

export function ClientHeader() {
  const user = useAuthStore((state) => state.user)!
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  function signOut() { logout(); queryClient.clear(); navigate('/login', { replace: true }) }
  return (
    <header className="client-header">
      <div className="client-header__inner">
        <Link className="client-header__brand" to="/cliente/agendamentos" aria-label="Leila - início">
          <img src="/assets/leila-logo.png" alt="Leila" />
        </Link>

        <div className="client-header__account">
          <span className="client-header__avatar" aria-hidden="true">{initials}</span>
          <div className="client-header__identity">
            <span>Olá,</span>
            <strong>{user.name}</strong>
          </div>
          <button className="logout-button" type="button" onClick={signOut}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
