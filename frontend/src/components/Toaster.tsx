import { useSyncExternalStore } from 'react'
import { toastStore } from '../lib/toast'

export function Toaster() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.snapshot, toastStore.snapshot)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === 'error' ? 'alert' : 'status'}
          className="pointer-events-auto flex items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-canvas shadow-lg"
        >
          <span aria-hidden="true">{t.tone === 'error' ? '⚠️' : '✓'}</span>
          {t.message}
          <button
            type="button"
            onClick={() => toastStore.dismiss(t.id)}
            className="ml-1 rounded px-1 opacity-70 hover:opacity-100"
            aria-label="Fermer la notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
