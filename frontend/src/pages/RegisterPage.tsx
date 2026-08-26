import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthLayout } from '../components/auth/AuthLayout'
import { BrandLink } from '../components/auth/BrandLink'
import { FormField } from '../components/auth/FormField'
import { registerClient } from '../api/auth.api'
import { getApiError } from '../lib/apiError'

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const mutation = useMutation({ mutationFn: registerClient })
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password')); const confirmation = String(form.get('passwordConfirmation'))
    if (password !== confirmation) { setError('As senhas não coincidem.'); return }
    try {
      await mutation.mutateAsync({ name: String(form.get('name')), email: String(form.get('email')), phone: String(form.get('phone')).replace(/\D/g, ''), password })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (requestError) { setError(getApiError(requestError)) }
  }
  return (
    <AuthLayout variant="register">
      <BrandLink />

      <div className="auth-heading">
        <h1>Crie seu espaço</h1>
        <p>Cadastre-se para agendar seus cuidados do seu jeito.</p>
      </div>

      <form className="auth-form auth-form--register" onSubmit={submit}>
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

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Criando conta...' : 'Criar conta'}
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
