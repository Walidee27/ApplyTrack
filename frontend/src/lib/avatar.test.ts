import { describe, expect, it } from 'vitest'
import { avatarTone, initials } from './avatar'

describe('initials', () => {
  it('prend la première lettre des deux premiers mots', () => {
    expect(initials('Société Générale')).toBe('SG')
    expect(initials('Dassault Systèmes')).toBe('DS')
  })

  it('prend les deux premières lettres d’un nom en un seul mot', () => {
    expect(initials('Doctolib')).toBe('DO')
  })

  it('gère les tirets, apostrophes et espaces superflus', () => {
    expect(initials('  Hewlett-Packard ')).toBe('HP')
    expect(initials("L'Oréal")).toBe('LO')
    expect(initials('')).toBe('?')
  })
})

describe('avatarTone', () => {
  it('donne toujours la même teinte à une même entreprise, sans tenir compte de la casse', () => {
    expect(avatarTone('Qonto')).toBe(avatarTone('qonto'))
  })
})
