// Teintes neutres, volontairement distinctes des couleurs de statut pour ne pas les confondre
const TONES = [
  'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
  'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200',
  'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200',
]

/** Initiales d'une entreprise : « Société Générale » → « SG », « Doctolib » → « DO ». */
export function initials(company: string): string {
  const words = company.trim().split(/[\s\-']+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/** Toujours la même teinte pour une même entreprise. */
export function avatarTone(company: string): string {
  let hash = 0
  for (const char of company.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return TONES[Math.abs(hash) % TONES.length]
}
