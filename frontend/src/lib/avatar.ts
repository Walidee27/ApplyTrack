/**
 * « Code de vol » d'une entreprise, affiché sur les cartes comme un code aéroport :
 * « Société Générale » → « SG », « Doctolib » → « DOC ».
 */
export function flightCode(company: string): string {
  const words = company
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .split(/[\s\-']+/)
    .filter(Boolean)
  if (words.length === 0) return '???'
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/** Nom court façon liste de passagers : « Walide Ghazanfar » → « W. GHAZANFAR ». */
export function passengerName(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 1) return displayName.toUpperCase()
  return `${words[0][0]}. ${words.slice(1).join(' ')}`.toUpperCase()
}
