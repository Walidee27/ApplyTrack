import { describe, expect, it } from 'vitest'
import type { JobApplication } from '../api/types'
import { daysSince, groupByStatus, isApplicationStatus } from './status'

const application = (overrides: Partial<JobApplication>): JobApplication => ({
  id: 1,
  company: 'Acme',
  title: 'Développeur full-stack',
  location: null,
  jobUrl: null,
  status: 'APPLIED',
  appliedOn: '2026-09-01',
  notes: null,
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
  statusChangedAt: '2026-09-01T10:00:00Z',
  ...overrides,
})

describe('groupByStatus', () => {
  it('crée une colonne pour chaque statut, même vide', () => {
    const groups = groupByStatus([])
    expect(Object.keys(groups)).toEqual(['APPLIED', 'FOLLOW_UP', 'INTERVIEW', 'OFFER', 'REJECTED'])
    expect(groups.OFFER).toEqual([])
  })

  it('range les candidatures par statut, les plus récentes en premier', () => {
    const groups = groupByStatus([
      application({ id: 1, appliedOn: '2026-09-01' }),
      application({ id: 2, appliedOn: '2026-09-10' }),
      application({ id: 3, status: 'INTERVIEW' }),
    ])
    expect(groups.APPLIED.map((a) => a.id)).toEqual([2, 1])
    expect(groups.INTERVIEW.map((a) => a.id)).toEqual([3])
  })
})

describe('daysSince', () => {
  it('compte les jours entiers écoulés', () => {
    expect(daysSince('2026-09-01T00:00:00Z', new Date('2026-09-08T12:00:00Z'))).toBe(7)
  })

  it('ne renvoie jamais de valeur négative', () => {
    expect(daysSince('2026-09-10T00:00:00Z', new Date('2026-09-08T00:00:00Z'))).toBe(0)
  })
})

describe('isApplicationStatus', () => {
  it('reconnaît uniquement les statuts connus', () => {
    expect(isApplicationStatus('OFFER')).toBe(true)
    expect(isApplicationStatus('offer')).toBe(false)
    expect(isApplicationStatus(42)).toBe(false)
  })
})
