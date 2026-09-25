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
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-brand px-4 py-2.5 font-mono text-xs font-bold tracking-wider text-on-brand uppercase"
    >
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      Serveur en cours de démarrage · environ une minute d'attente
    </div>
  )
}
