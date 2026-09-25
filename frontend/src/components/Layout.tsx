import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { Modal } from './Modal'
import { PreferencesForm } from './PreferencesForm'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

export function Layout() {
  const { user, signOut, updateUser } = useAuth()
  const [showPreferences, setShowPreferences] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-4 text-lg font-bold tracking-tight">ApplyTrack</span>
          <nav className="flex gap-1" aria-label="Navigation principale">
            <NavLink to="/" end className={navLinkClass}>
              Tableau
            </NavLink>
            <NavLink to="/stats" className={navLinkClass}>
              Statistiques
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <span className="hidden px-2 text-sm text-slate-500 sm:inline">{user?.displayName}</span>
            <button
              type="button"
              onClick={() => setShowPreferences(true)}
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Préférences
            </button>
            <button type="button" onClick={signOut} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>

      {showPreferences && user && (
        <Modal title="Préférences de relance" onClose={() => setShowPreferences(false)}>
          <PreferencesForm
            user={user}
            onSaved={(updated) => {
              updateUser(updated)
              setShowPreferences(false)
            }}
            onCancel={() => setShowPreferences(false)}
          />
        </Modal>
      )}
    </div>
  )
}
