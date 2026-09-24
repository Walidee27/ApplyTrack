import { apiFetch } from './client'
import type { ApplicationStatus, AuthResponse, JobApplication, JobApplicationInput, User } from './types'

export const authApi = {
  register: (body: { email: string; password: string; displayName: string }) =>
    apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiFetch<User>('/api/auth/me'),
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
