import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { avatarTone, initials } from '../lib/avatar'
import { buttonClass } from '../lib/button'
import { toast } from '../lib/toast'
import { Modal } from './Modal'
import { PreferencesForm } from './PreferencesForm'
import { Logo, ThemeToggle } from './ui'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-soft text-brand-ink' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
  }`

export function Layout() {
  const { user, signOut, updateUser } = useAuth()
  const [showPreferences, setShowPreferences] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <Link to="/app" className="mr-2 sm:mr-6" aria-label="ApplyTrack, retour au tableau">
            {/* Logo complet sur grand écran, icône seule sur mobile */}
            <span className="hidden sm:block">
              <Logo />
            </span>
            <span className="sm:hidden">
              <Logo withName={false} />
            </span>
          </Link>
          <nav className="flex gap-1" aria-label="Navigation principale">
            <NavLink to="/app" end className={navLinkClass}>
              Tableau
            </NavLink>
            <NavLink to="/app/stats" className={navLinkClass}>
              Statistiques
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className={buttonClass('ghost')}
              aria-label="Préférences de relance"
              title="Préférences"
            >
              <span aria-hidden="true">⚙️</span>
              <span className="hidden md:inline">Préférences</span>
            </button>
            {user && (
              <span
                className={`ml-1 hidden h-8 w-8 items-center justify-center rounded-full text-xs font-bold sm:flex ${avatarTone(user.displayName)}`}
                title={`${user.displayName} (${user.email})`}
                aria-hidden="true"
              >
                {initials(user.displayName)}
              </span>
            )}
            <button type="button" onClick={signOut} className={buttonClass('ghost')}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>

      {showPreferences && user && (
        <Modal title="Préférences de relance" onClose={() => setShowPreferences(false)}>
          <PreferencesForm
            user={user}
            onSaved={(updated) => {
              updateUser(updated)
              setShowPreferences(false)
              toast('Préférences enregistrées')
            }}
            onCancel={() => setShowPreferences(false)}
          />
        </Modal>
      )}
    </div>
  )
}
