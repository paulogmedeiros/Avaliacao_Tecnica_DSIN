import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { BrandLink } from '../components/auth/BrandLink'
import { FormField } from '../components/auth/FormField'

export function RegisterPage() {
  return (
    <AuthLayout variant="register">
      <BrandLink />

      <div className="auth-heading">
        <h1>Crie seu espaço</h1>
        <p>Cadastre-se para agendar seus cuidados do seu jeito.</p>
      </div>

      <form className="auth-form auth-form--register">
        <FormField
          autoComplete="name"
          label="Nome completo"
          name="name"
          placeholder="Como podemos chamar você?"
        />
        <FormField
          autoComplete="email"
          label="E-mail"
          name="email"
          placeholder="voce@exemplo.com"
          type="email"
        />
        <FormField
          autoComplete="tel"
          label="Telefone"
          name="phone"
          placeholder="(00) 00000-0000"
          type="tel"
        />
        <div className="auth-form__row">
          <FormField
            autoComplete="new-password"
            label="Senha"
            name="password"
            placeholder="Crie uma senha"
            type="password"
          />
          <FormField
            autoComplete="new-password"
            label="Confirme sua senha"
            name="passwordConfirmation"
            placeholder="Repita sua senha"
            type="password"
          />
        </div>

        <button className="primary-button" type="button">
          Criar conta
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M14 7l5 5-5 5" />
          </svg>
        </button>
      </form>

      <p className="auth-switch">
        Já possui uma conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  )
}
