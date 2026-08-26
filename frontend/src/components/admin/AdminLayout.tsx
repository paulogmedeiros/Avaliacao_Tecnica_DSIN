import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { getAdminNavigation } from './adminNavigation.js'
import { useAuthStore } from '../../stores/auth.store'

function NavigationIcon({ name }: { name: 'dashboard' | 'calendar' | 'services' }) {
  if (name === 'dashboard') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  }

  if (name === 'calendar') return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M6 3v3M18 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" /><path d="M8 13h3M8 17h3M14 13h2M14 17h2" /></svg>

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h14" /><circle cx="8" cy="7" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="10" cy="17" r="2" /></svg>
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const navigation = getAdminNavigation(pathname)
  const user = useAuthStore((state) => state.user)!
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient(); const navigate = useNavigate()
  const initial = user.name.charAt(0).toUpperCase()
  function signOut() { logout(); queryClient.clear(); navigate('/login', { replace: true }) }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/admin/dashboard" aria-label="Leila — início administrativo">
          <img src="/assets/leila-logo.png" alt="Leila" />
          <span>Administração</span>
        </Link>

        <nav className="admin-nav" aria-label="Navegação administrativa">
          <span className="admin-nav__label">Menu principal</span>
          {navigation.map((item) => (
            <NavLink className={item.isActive ? 'admin-nav__item is-active' : 'admin-nav__item'} to={item.href} key={item.href}>
              <NavigationIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-profile">
            <span className="admin-profile__avatar" aria-hidden="true">{initial}</span>
            <span><strong>{user.name}</strong><small>Administradora</small></span>
          </div>
          <button className="admin-logout" type="button" onClick={signOut} aria-label="Sair da área administrativa">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /></svg>
          </button>
        </div>
      </aside>

      <header className="admin-mobile-header">
        <Link className="admin-mobile-brand" to="/admin/dashboard"><img src="/assets/leila-logo.png" alt="Leila" /></Link>
        <div><span className="admin-profile__avatar" aria-hidden="true">{initial}</span><button className="admin-logout" type="button" onClick={signOut} aria-label="Sair"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /></svg></button></div>
      </header>

      <nav className="admin-mobile-nav" aria-label="Navegação administrativa móvel">
        {navigation.map((item) => (
          <NavLink className={item.isActive ? 'is-active' : ''} to={item.href} key={item.href}>
            <NavigationIcon name={item.icon} /><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="admin-content"><Outlet /></main>
    </div>
  )
}
