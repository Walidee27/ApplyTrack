import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { authApi } from '../api/endpoints'
import type { AuthResponse } from '../api/types'
import { DEMO_ENABLED, useDemoLogin } from '../auth/useDemoLogin'
import { useAuth } from '../auth/useAuth'
import { TextField } from '../components/TextField'
import { Logo, ThemeToggle } from '../components/ui'
import { buttonClass } from '../lib/button'

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
    onSuccess: (response: AuthResponse) => {
      signIn(response)
      navigate('/app', { replace: true })
    },
  })
  const demoMutation = useDemoLogin()

  const failed = mutation.error ?? demoMutation.error
  const error = failed instanceof ApiError ? failed : null
  const isPending = mutation.isPending || demoMutation.isPending

  const update = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau de marque, masqué sur mobile */}
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-on-brand lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <Link to="/" className="relative">
          <span className="text-2xl font-bold tracking-tight">ApplyTrack</span>
        </Link>
        <div className="relative max-w-md">
          <p className="text-3xl leading-tight font-semibold">
            Toutes tes candidatures au même endroit, et plus aucune relance oubliée.
          </p>
          <ul className="mt-8 space-y-3 text-base opacity-90">
            <li>📋 Un kanban pour suivre chaque étape</li>
            <li>⏰ Un e-mail quand il est temps de relancer</li>
            <li>📊 Tes vrais taux de réponse et d'entretien</li>
          </ul>
        </div>
        <p className="relative text-sm opacity-75">Projet open source · React, Spring Boot, PostgreSQL</p>
      </aside>

      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:invisible">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold tracking-tight">{isRegister ? 'Crée ton compte' : 'Content de te revoir'}</h1>
          <p className="mt-2 text-ink-muted">
            {isRegister ? 'Gratuit, sans carte bancaire.' : 'Connecte-toi pour retrouver ton tableau.'}
          </p>

          {DEMO_ENABLED && (
            <>
              <button
                type="button"
                onClick={() => demoMutation.mutate()}
                disabled={isPending}
                className={`mt-8 w-full ${buttonClass('secondary', 'lg')}`}
              >
                {demoMutation.isPending ? 'Connexion à la démo…' : '👀 Essayer avec le compte démo'}
              </button>
              <div className="my-6 flex items-center gap-3 text-xs text-ink-faint">
                <span className="h-px flex-1 bg-line" />
                ou avec ton e-mail
                <span className="h-px flex-1 bg-line" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className={`space-y-4 ${DEMO_ENABLED ? '' : 'mt-8'}`} noValidate>
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
              <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
                {error.message}
              </p>
            )}

            <button type="submit" disabled={isPending} className={`w-full ${buttonClass('primary', 'lg')}`}>
              {mutation.isPending ? 'Un instant…' : isRegister ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-muted">
            {isRegister ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
            <Link to={isRegister ? '/login' : '/register'} className="font-semibold text-brand hover:underline">
              {isRegister ? 'Se connecter' : "S'inscrire"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
