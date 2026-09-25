export const APPLICATION_STATUSES = ['APPLIED', 'FOLLOW_UP', 'INTERVIEW', 'OFFER', 'REJECTED'] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export interface User {
  id: number
  email: string
  displayName: string
  remindersEnabled: boolean
  reminderAfterDays: number
}

export interface ReminderPreferences {
  remindersEnabled: boolean
  reminderAfterDays: number
}

export interface WeeklyCount {
  weekStart: string
  count: number
}

export interface Stats {
  total: number
  byStatus: Record<ApplicationStatus, number>
  /** Part des candidatures ayant reçu une réponse (entretien, offre ou refus), entre 0 et 1 */
  responseRate: number
  /** Part des candidatures ayant mené à un entretien ou une offre, entre 0 et 1 */
  interviewRate: number
  /** Délai moyen entre l'envoi et la première réponse, ou null s'il n'y a encore eu aucune réponse */
  averageResponseDays: number | null
  weekly: WeeklyCount[]
}

export interface AuthResponse {
  token: string
  user: User
}

export interface JobApplication {
  id: number
  company: string
  title: string
  location: string | null
  jobUrl: string | null
  status: ApplicationStatus
  appliedOn: string
  notes: string | null
  createdAt: string
  updatedAt: string
  statusChangedAt: string
}

export interface JobApplicationInput {
  company: string
  title: string
  location: string | null
  jobUrl: string | null
  status: ApplicationStatus
  appliedOn: string
  notes: string | null
}
