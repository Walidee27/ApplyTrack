import { APPLICATION_STATUSES, type ApplicationStatus, type JobApplication } from '../api/types'

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Envoyée',
  FOLLOW_UP: 'Relancée',
  INTERVIEW: 'Entretien',
  OFFER: 'Offre',
  REJECTED: 'Refusée',
}

// Palette vérifiée pour le daltonisme (deutéranopie, protanopie, tritanopie) :
// rose-600 plutôt que rose-500 pour rester distinct d'emerald-500.
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-sky-500',
  FOLLOW_UP: 'bg-amber-500',
  INTERVIEW: 'bg-violet-500',
  OFFER: 'bg-emerald-500',
  REJECTED: 'bg-rose-600',
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
