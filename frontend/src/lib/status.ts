import { APPLICATION_STATUSES, type ApplicationStatus, type JobApplication } from '../api/types'

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Envoyée',
  FOLLOW_UP: 'Relancée',
  INTERVIEW: 'Entretien',
  OFFER: 'Offre',
  REJECTED: 'Refusée',
}

/** Équivalent « tableau des départs » de chaque statut, affiché sous son nom réel. */
export const STATUS_FLIGHT_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "À l'heure",
  FOLLOW_UP: 'En approche',
  INTERVIEW: 'Embarquement',
  OFFER: 'Décollé',
  REJECTED: 'Annulé',
}

// Couleurs définies dans index.css (--color-status-*), vérifiées pour le daltonisme
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-status-applied',
  FOLLOW_UP: 'bg-status-follow-up',
  INTERVIEW: 'bg-status-interview',
  OFFER: 'bg-status-offer',
  REJECTED: 'bg-status-rejected',
}

/** Statuts pour lesquels on attend encore une réponse de l'entreprise. */
const AWAITING_RESPONSE: readonly ApplicationStatus[] = ['APPLIED', 'FOLLOW_UP']

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && (APPLICATION_STATUSES as readonly string[]).includes(value)
}

/** Regroupe les candidatures par colonne du kanban, les plus récentes en premier. */
export function groupByStatus(applications: JobApplication[]): Record<ApplicationStatus, JobApplication[]> {
  const groups = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [status, [] as JobApplication[]]),
  ) as Record<ApplicationStatus, JobApplication[]>

  for (const application of applications) {
    groups[application.status].push(application)
  }
  for (const status of APPLICATION_STATUSES) {
    groups[status].sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))
  }
  return groups
}

/** Nombre de jours écoulés depuis une date ISO (AAAA-MM-JJ ou horodatage). */
export function daysSince(isoDate: string, now: Date = new Date()): number {
  const elapsed = now.getTime() - new Date(isoDate).getTime()
  return Math.max(0, Math.floor(elapsed / 86_400_000))
}

/** Même règle que le back : en attente de réponse et sans changement depuis au moins `afterDays` jours. */
export function needsFollowUp(application: JobApplication, afterDays: number, now: Date = new Date()): boolean {
  return AWAITING_RESPONSE.includes(application.status) && daysSince(application.statusChangedAt, now) >= afterDays
}
