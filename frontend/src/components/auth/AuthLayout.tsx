import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  variant: 'login' | 'register'
}

export function AuthLayout({ children, variant }: AuthLayoutProps) {
  const isLogin = variant === 'login'

  return (
    <main className={`auth-page auth-page--${variant}`}>
      <section className="auth-shell" aria-label={isLogin ? 'Acesso à conta' : 'Criação de conta'}>
        <div className="auth-form-panel">{children}</div>

        <aside className="auth-visual" aria-label="Leila Salão">
          <div className="auth-visual__line auth-visual__line--top" />
          <div className="auth-visual__line auth-visual__line--bottom" />
          <div className="auth-visual__burst auth-visual__burst--one" />
          <div className="auth-visual__burst auth-visual__burst--two" />

          <img className="auth-visual__logo" src="/assets/leila-logo.png" alt="Leila" />

          <div className="auth-visual__copy">
            {isLogin ? (
              <h2>
                Sua beleza começa com um momento <em>só seu.</em>
              </h2>
            ) : (
              <h2>
                Seu tempo.<br />
                <em>Seu cuidado.</em><br />
                Sua beleza.
              </h2>
            )}
            {isLogin ? (
              <p>Entre para cuidar dos seus agendamentos com tranquilidade.</p>
            ) : null}
          </div>

          <img
            className="auth-visual__photo"
            src="/assets/leila-hero.png"
            alt="Cliente sorrindo com os cabelos soltos"
          />
        </aside>
      </section>
    </main>
  )
}
