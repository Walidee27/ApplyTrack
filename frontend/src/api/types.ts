export const APPLICATION_STATUSES = ['APPLIED', 'FOLLOW_UP', 'INTERVIEW', 'OFFER', 'REJECTED'] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export interface User {
  id: number
  email: string
  displayName: string
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
