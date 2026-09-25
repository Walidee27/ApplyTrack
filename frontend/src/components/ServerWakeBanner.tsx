import { useEffect, useState } from 'react'
import { onSlowRequestChange } from '../api/client'

/** Bandeau affiché quand une requête traîne : l'API gratuite est probablement en train de se réveiller. */
export function ServerWakeBanner() {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => onSlowRequestChange(setIsSlow), [])

  if (!isSlow) return null
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900 shadow"
    >
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-700 border-t-transparent" aria-hidden="true" />
      Le serveur de démonstration se réveille, cela peut prendre jusqu'à une minute…
    </div>
  )
}
