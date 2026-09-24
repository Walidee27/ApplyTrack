import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { authApi } from '../api/endpoints'
import { useAuth } from '../auth/useAuth'
import { TextField } from '../components/TextField'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register'
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })

  const mutation = useMutation({
    mutationFn: () =>
      isRegister
        ? authApi.register(form)
        : authApi.login({ email: form.email, password: form.password }),
    onSuccess: (response) => {
      signIn(response)
      navigate('/', { replace: true })
    },
  })

  const error = mutation.error instanceof ApiError ? mutation.error : null
  const update = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold">ApplyTrack</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isRegister ? 'Crée ton compte pour suivre tes candidatures.' : 'Content de te revoir !'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {isRegister && (
            <TextField
              label="Nom affiché"
              name="displayName"
              value={form.displayName}
              onChange={update('displayName')}
              error={error?.fieldErrors.displayName}
              required
            />
          )}
          <TextField
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            error={error?.fieldErrors.email}
            required
          />
          <TextField
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={update('password')}
            error={error?.fieldErrors.password}
            required
          />

          {error && Object.keys(error.fieldErrors).length === 0 && (
            <p role="alert" className="text-sm text-rose-600">
              {error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {mutation.isPending ? 'Un instant…' : isRegister ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
          <Link to={isRegister ? '/login' : '/register'} className="font-medium text-indigo-600 hover:underline">
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </Link>
        </p>
      </div>
    </main>
  )
}
