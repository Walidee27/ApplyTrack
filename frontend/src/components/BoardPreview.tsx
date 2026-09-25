import type { ApplicationStatus } from '../api/types'
import { STATUS_COLORS, STATUS_LABELS } from '../lib/status'
import { ApplicationCardView } from './ApplicationCardView'

interface PreviewCard {
  company: string
  title: string
  location: string
  days: number
  toFollowUp?: boolean
}

const COLUMNS: { status: ApplicationStatus; cards: PreviewCard[] }[] = [
  {
    status: 'APPLIED',
    cards: [
      { company: 'Leboncoin', title: 'Alternance développeur React', location: 'Paris', days: 12, toFollowUp: true },
      { company: 'Ubisoft', title: 'Alternance développeur outils', location: 'Montreuil', days: 2 },
    ],
  },
  {
    status: 'FOLLOW_UP',
    cards: [{ company: 'Orange', title: 'Alternance DevOps', location: 'Châtillon', days: 15, toFollowUp: true }],
  },
  {
    status: 'INTERVIEW',
    cards: [
      { company: 'Qonto', title: 'Alternant full-stack', location: 'Paris', days: 3 },
      { company: 'Doctolib', title: 'Alternant back-end', location: 'Paris', days: 8 },
    ],
  },
  {
    status: 'OFFER',
    cards: [{ company: 'Société Générale', title: 'Alternant développeur Java', location: 'La Défense', days: 1 }],
  },
]

/**
 * Aperçu non interactif du tableau, rendu avec les vrais composants de l'application
 * (et non une capture d'écran) : il suit donc le thème clair ou sombre.
 */
export function BoardPreview() {
  return (
    <div className="rounded-2xl bg-surface p-2 shadow-2xl ring-1 ring-line" aria-hidden="true">
      {/* Barre de fenêtre stylisée */}
      <div className="flex items-center gap-1.5 px-2 pt-1 pb-2">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="ml-3 rounded-md bg-surface-muted px-3 py-0.5 text-[11px] text-ink-faint">applytrack.app/app</span>
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-canvas p-2 md:grid-cols-4">
        {COLUMNS.map(({ status, cards }, index) => (
          <div key={status} className={`rounded-xl bg-surface-muted p-2 ${index >= 2 ? 'hidden md:block' : ''}`}>
            <div className="mb-2 flex items-center gap-1.5 px-1">
              <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
              <span className="text-xs font-semibold">{STATUS_LABELS[status]}</span>
              <span className="ml-auto text-[11px] text-ink-faint">{cards.length}</span>
            </div>
            <div className="space-y-2">
              {cards.map((card) => (
                <ApplicationCardView key={card.company} {...card} toFollowUp={card.toFollowUp ?? false} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
