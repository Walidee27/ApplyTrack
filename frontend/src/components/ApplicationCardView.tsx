import type { ReactNode } from 'react'
import { avatarTone, initials } from '../lib/avatar'

interface ApplicationCardViewProps {
  company: string
  title: string
  location: string | null
  days: number
  toFollowUp: boolean
  /** Bouton « Modifier » (absent sur l'aperçu de la page d'accueil) */
  action?: ReactNode
  highlighted?: boolean
}

/** Apparence d'une carte, sans logique : partagée par le kanban et l'aperçu de la page d'accueil. */
export function ApplicationCardView({ company, title, location, days, toFollowUp, action, highlighted }: ApplicationCardViewProps) {
  return (
    <div
      className={`rounded-xl bg-surface p-3 shadow-sm ring-1 transition-shadow ${
        toFollowUp ? 'ring-warning-line' : 'ring-line'
      } ${highlighted ? 'shadow-lg' : 'hover:shadow-md'}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${avatarTone(company)}`}
          aria-hidden="true"
        >
          {initials(company)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{company}</h3>
          <p className="truncate text-sm text-ink-muted">{title}</p>
        </div>
        {action}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-faint">
        {toFollowUp && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 font-medium text-warning-ink ring-1 ring-warning-line">
            <span aria-hidden="true">⏰</span> À relancer
          </span>
        )}
        <span>
          {location ? `${location} · ` : ''}
          {days === 0 ? "Mis à jour aujourd'hui" : `Sans changement depuis ${days} j`}
        </span>
      </div>
    </div>
  )
}
