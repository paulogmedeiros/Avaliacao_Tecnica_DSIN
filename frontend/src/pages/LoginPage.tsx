import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { AuthLayout } from '../components/auth/AuthLayout'
import { BrandLink } from '../components/auth/BrandLink'
import { FormField } from '../components/auth/FormField'
import { login } from '../api/auth.api'
import { getApiError } from '../lib/apiError'
import { useAuthStore } from '../stores/auth.store'

export function LoginPage() {
  const navigate = useNavigate()
  const session = useAuthStore((state) => state.user)
  const setToken = useAuthStore((state) => state.setToken)
  const [error, setError] = useState('')
  const mutation = useMutation({ mutationFn: login })
  if (session) return <Navigate to={session.role === 'ADMIN' ? '/admin/dashboard' : '/cliente/agendamentos'} replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await mutation.mutateAsync({ email: String(form.get('email')), password: String(form.get('password')) })
      if (!setToken(result.access_token)) throw new Error('Sessão inválida')
      const role = useAuthStore.getState().user?.role
      navigate(role === 'ADMIN' ? '/admin/dashboard' : '/cliente/agendamentos', { replace: true })
    } catch (requestError) { setError(getApiError(requestError)) }
  }
  return (
    <AuthLayout variant="login">
      <BrandLink />

      <div className="auth-heading">
        <h1>Bem-vinda de volta</h1>
      </div>

      <form className="auth-form" onSubmit={submit}>
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

        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Entrando...' : 'Entrar'}
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
