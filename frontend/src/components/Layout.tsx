import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { passengerName } from '../lib/avatar'
import { buttonClass } from '../lib/button'
import { toast } from '../lib/toast'
import { Modal } from './Modal'
import { PreferencesForm } from './PreferencesForm'
import { Logo } from './ui'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3.5 py-2.5 font-mono text-xs tracking-wider uppercase transition-colors ${
    isActive ? 'bg-brand font-bold text-on-brand' : 'text-ink-muted hover:text-brand'
  }`

export function Layout() {
  const { user, signOut, updateUser } = useAuth()
  const [showPreferences, setShowPreferences] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-[90rem] items-center gap-2 px-4 py-3 sm:px-8">
          <Link to="/app" className="mr-2 sm:mr-6" aria-label="ApplyTrack, retour au tableau">
            {/* Logo complet sur grand écran, pictogramme seul sur mobile */}
            <span className="hidden sm:block">
              <Logo />
            </span>
            <span className="sm:hidden">
              <Logo withName={false} />
            </span>
          </Link>
          <nav className="flex gap-1" aria-label="Navigation principale">
            <NavLink to="/app" end className={navLinkClass}>
              Départs
            </NavLink>
            <NavLink to="/app/stats" className={navLinkClass}>
              Bilan
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <span className="hidden sm:inline-flex">
              <button type="button" onClick={() => setShowPreferences(true)} className={buttonClass('outline')}>
                Préférences
              </button>
            </span>
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className={`${buttonClass('ghost')} sm:hidden`}
              aria-label="Préférences de relance"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
              </svg>
            </button>
            {user && (
              <span className="hidden px-3 font-mono text-xs tracking-wider text-ink-faint md:inline" title={user.email}>
                {passengerName(user.displayName)}
              </span>
            )}
            <button type="button" onClick={signOut} className={buttonClass('ghost')}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[90rem] px-4 pb-10 sm:px-8">
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
