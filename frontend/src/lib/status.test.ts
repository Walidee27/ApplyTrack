import { describe, expect, it } from 'vitest'
import type { JobApplication } from '../api/types'
import { daysSince, groupByStatus, isApplicationStatus, needsFollowUp } from './status'

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

describe('needsFollowUp', () => {
  const now = new Date('2026-09-20T12:00:00Z')

  it('signale une candidature en attente depuis au moins le délai choisi', () => {
    expect(needsFollowUp(application({ statusChangedAt: '2026-09-13T10:00:00Z' }), 7, now)).toBe(true)
    expect(needsFollowUp(application({ statusChangedAt: '2026-09-15T10:00:00Z' }), 7, now)).toBe(false)
  })

  it("ne signale pas une candidature qui a déjà reçu une réponse", () => {
    const old = { statusChangedAt: '2026-08-01T10:00:00Z' }
    expect(needsFollowUp(application({ ...old, status: 'FOLLOW_UP' }), 7, now)).toBe(true)
    expect(needsFollowUp(application({ ...old, status: 'INTERVIEW' }), 7, now)).toBe(false)
    expect(needsFollowUp(application({ ...old, status: 'REJECTED' }), 7, now)).toBe(false)
  })
})

describe('isApplicationStatus', () => {
  it('reconnaît uniquement les statuts connus', () => {
    expect(isApplicationStatus('OFFER')).toBe(true)
    expect(isApplicationStatus('offer')).toBe(false)
    expect(isApplicationStatus(42)).toBe(false)
  })
})
