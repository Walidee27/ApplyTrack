import { describe, expect, it } from 'vitest'
import { flightCode, passengerName } from './avatar'

describe('flightCode', () => {
  it('prend les initiales des noms en plusieurs mots', () => {
    expect(flightCode('Société Générale')).toBe('SG')
    expect(flightCode('BNP Paribas')).toBe('BP')
  })

  it('prend les trois premières lettres d’un nom en un seul mot, sans accents', () => {
    expect(flightCode('Doctolib')).toBe('DOC')
    expect(flightCode('Écolab')).toBe('ECO')
  })

  it('gère les tirets, apostrophes et espaces superflus', () => {
    expect(flightCode('  Hewlett-Packard ')).toBe('HP')
    expect(flightCode("L'Oréal")).toBe('LO')
    expect(flightCode('')).toBe('???')
  })
})

describe('passengerName', () => {
  it('abrège le prénom comme sur une liste de passagers', () => {
    expect(passengerName('Walide Ghazanfar')).toBe('W. GHAZANFAR')
    expect(passengerName('Compte démo')).toBe('C. DÉMO')
    expect(passengerName('Walide')).toBe('WALIDE')
  })
})
