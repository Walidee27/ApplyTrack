import type { ReactNode } from 'react'
import type { ApplicationStatus } from '../api/types'
import { flightCode } from '../lib/avatar'

interface ApplicationCardViewProps {
  company: string
  title: string
  location: string | null
  /** Date d'envoi, AAAA-MM-JJ */
  appliedOn: string
  status: ApplicationStatus
  /** Jours écoulés depuis le dernier changement de statut */
  days: number
  toFollowUp: boolean
  /** Bouton « Modifier » (absent sur l'aperçu de la page d'accueil) */
  action?: ReactNode
  highlighted?: boolean
}

const shortDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

/**
 * Carte d'embarquement : apparence d'une candidature, sans logique.
 * Partagée par le tableau et l'aperçu de la page d'accueil.
 */
export function ApplicationCardView(props: ApplicationCardViewProps) {
  const { company, title, location, appliedOn, status, days, toFollowUp, action, highlighted } = props
  const isOffer = status === 'OFFER'
  const isRejected = status === 'REJECTED'

  const frame = isOffer
    ? 'bg-status-offer text-on-brand'
    : isRejected
      ? 'border border-dashed border-line-strong text-ink-faint'
      : `border bg-canvas ${toFollowUp ? 'border-brand' : 'border-line'}`

  return (
    <div className={`p-3.5 transition-shadow ${frame} ${highlighted ? 'shadow-[0_0_0_2px_var(--color-brand)]' : ''}`}>
      <div className={`flex items-center justify-between font-mono text-[11px] ${isOffer ? 'font-bold' : 'text-ink-faint'}`}>
        <span>ENVOI {shortDate(appliedOn)}</span>
        <span className="flex items-center gap-2">
          {flightCode(company)}
          {action}
        </span>
      </div>
      <h3
        className={`mt-2 truncate pt-0.5 text-[1.35rem] leading-[1.1] font-extrabold uppercase ${isRejected ? 'line-through' : ''}`}
        style={{ fontStretch: '75%' }}
      >
        {company}
      </h3>
      <p className={`mt-1.5 truncate font-mono text-xs ${isOffer || isRejected ? '' : 'text-ink-muted'}`}>
        {title}
        {location ? ` · ${location}` : ''}
      </p>
      {toFollowUp ? (
        <p className="mt-3 inline-block bg-brand px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-on-brand">
          RETARDÉ {days} J · RELANCER
        </p>
      ) : (
        !isOffer &&
        !isRejected && (
          <p className="mt-3 font-mono text-[11px] tracking-wider text-ink-faint">
            {days === 0 ? "MIS À JOUR AUJOURD'HUI" : `${days} J SANS CHANGEMENT`}
          </p>
        )
      )}
    </div>
  )
}
