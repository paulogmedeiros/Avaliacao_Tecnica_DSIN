import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { BrandLink } from '../components/auth/BrandLink'
import { FormField } from '../components/auth/FormField'

export function LoginPage() {
  return (
    <AuthLayout variant="login">
      <BrandLink />

      <div className="auth-heading">
        <h1>Bem-vinda de volta</h1>
      </div>

      <form className="auth-form">
        <FormField
          autoComplete="email"
          label="E-mail"
          name="email"
          placeholder="voce@exemplo.com"
          type="email"
        />
        <FormField
          autoComplete="current-password"
          label="Senha"
          name="password"
          placeholder="Digite sua senha"
          type="password"
        />

        <button className="primary-button" type="button">
          Entrar
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M14 7l5 5-5 5" />
          </svg>
        </button>
      </form>

      <p className="auth-switch">
        Ainda não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </AuthLayout>
  )
}
