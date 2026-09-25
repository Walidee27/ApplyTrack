/**
 * Graduations « propres » d'un axe partant de 0 (pas de 1, 2, 5, 10… × 10ⁿ, entiers uniquement),
 * dont la dernière est supérieure ou égale à la valeur maximale.
 */
export function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1]
  const rawStep = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? magnitude * 10)

  const ticks: number[] = [0]
  while (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step)
  return ticks
}
