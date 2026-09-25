import { apiFetch } from './client'
import type {
  ApplicationStatus,
  AuthResponse,
  JobApplication,
  JobApplicationInput,
  ReminderPreferences,
  Stats,
  User,
} from './types'

export const authApi = {
  register: (body: { email: string; password: string; displayName: string }) =>
    apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiFetch<User>('/api/auth/me'),
  updatePreferences: (body: ReminderPreferences) =>
    apiFetch<User>('/api/users/me/preferences', { method: 'PUT', body: JSON.stringify(body) }),
}

export const statsApi = {
  get: () => apiFetch<Stats>('/api/stats'),
}

export const applicationsApi = {
  list: () => apiFetch<JobApplication[]>('/api/applications'),
  create: (body: JobApplicationInput) =>
    apiFetch<JobApplication>('/api/applications', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: JobApplicationInput) =>
    apiFetch<JobApplication>(`/api/applications/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateStatus: (id: number, status: ApplicationStatus) =>
    apiFetch<JobApplication>(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  remove: (id: number) => apiFetch<void>(`/api/applications/${id}`, { method: 'DELETE' }),
}
