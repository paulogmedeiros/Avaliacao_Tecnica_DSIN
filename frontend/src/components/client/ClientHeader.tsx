import { Link } from 'react-router-dom'

export function ClientHeader() {
  return (
    <header className="client-header">
      <div className="client-header__inner">
        <Link className="client-header__brand" to="/cliente/agendamentos" aria-label="Leila - início">
          <img src="/assets/leila-logo.png" alt="Leila" />
        </Link>

        <div className="client-header__account">
          <span className="client-header__avatar" aria-hidden="true">MS</span>
          <div className="client-header__identity">
            <span>Olá,</span>
            <strong>Mariana Souza</strong>
          </div>
          <Link className="logout-button" to="/login">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
            </svg>
            <span>Sair</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
