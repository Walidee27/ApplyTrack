import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { authApi } from '../api/endpoints'
import type { AuthResponse } from '../api/types'
import { DEMO_ENABLED, useDemoLogin } from '../auth/useDemoLogin'
import { useAuth } from '../auth/useAuth'
import { TextField } from '../components/TextField'
import { Logo } from '../components/ui'
import { buttonClass } from '../lib/button'

const SERVICES = ['Suivi en temps réel', 'Annonce des retards', 'Bilan de vol']

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
      {/* Panneau d'affichage, masqué sur mobile */}
      <aside className="hidden flex-col gap-8 border-r border-line bg-surface p-14 lg:flex">
        <Link to="/" aria-label="ApplyTrack, accueil">
          <Logo />
        </Link>
        <h1 className="mt-auto board-title text-[7.5rem] break-words hyphens-auto" lang="fr">
          {isRegister ? 'Nouveau passager' : 'Enregis­trement'}
        </h1>
        <ul className="border-t border-line-strong font-mono text-sm">
          {SERVICES.map((service) => (
            <li key={service} className="flex justify-between border-b border-line py-3.5 uppercase">
              <span>{service}</span>
              <span className="text-status-offer">Ouvert</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex flex-col px-4 py-6 sm:px-10">
        <Link to="/" className="lg:hidden" aria-label="ApplyTrack, accueil">
          <Logo />
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <p className="board-label text-ink-faint">{isRegister ? 'Émission du billet' : "Porte d'accès"}</p>
          <h2 className="mt-2 text-5xl font-extrabold uppercase" style={{ fontStretch: '75%' }}>
            {isRegister ? 'Crée ton compte' : 'Content de te revoir'}
          </h2>

          {DEMO_ENABLED && (
            <>
              <button
                type="button"
                onClick={() => demoMutation.mutate()}
                disabled={isPending}
                className={`mt-8 w-full ${buttonClass('signal', 'lg')}`}
              >
                {demoMutation.isPending ? 'Embarquement…' : 'Embarquer sur la démo →'}
              </button>
              <div className="my-6 flex items-center gap-3 board-label text-[11px] text-ink-faint">
                <span className="h-px flex-1 bg-line" />
                ou avec ton e-mail
                <span className="h-px flex-1 bg-line" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className={`space-y-5 ${DEMO_ENABLED ? '' : 'mt-8'}`} noValidate>
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
              <p role="alert" className="border border-danger bg-danger-soft px-3 py-2.5 font-mono text-sm text-danger">
                {error.message}
              </p>
            )}

            <button type="submit" disabled={isPending} className={`w-full ${buttonClass('primary', 'lg')}`}>
              {mutation.isPending ? 'Un instant…' : isRegister ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-8 text-center font-mono text-sm text-ink-faint">
            {isRegister ? 'Déjà un billet ? ' : 'Pas encore de billet ? '}
            <Link to={isRegister ? '/login' : '/register'} className="font-bold text-brand hover:underline">
              {isRegister ? 'Se connecter' : "S'inscrire"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
