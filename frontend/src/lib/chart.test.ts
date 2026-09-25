import { describe, expect, it } from 'vitest'
import { niceTicks } from './chart'

describe('niceTicks', () => {
  it('renvoie un axe minimal quand il n’y a aucune donnée', () => {
    expect(niceTicks(0)).toEqual([0, 1])
  })

  it('utilise des pas entiers pour les petites valeurs', () => {
    expect(niceTicks(3)).toEqual([0, 1, 2, 3])
  })

  it('arrondit à des pas de 2, 5 ou 10', () => {
    expect(niceTicks(7)).toEqual([0, 2, 4, 6, 8])
    expect(niceTicks(18)).toEqual([0, 5, 10, 15, 20])
    expect(niceTicks(40)).toEqual([0, 10, 20, 30, 40])
  })
})
