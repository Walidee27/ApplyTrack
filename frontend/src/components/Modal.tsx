import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Fenêtre modale basée sur l'élément natif <dialog> (focus et touche Échap gérés par le navigateur). */
export function Modal({ title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal?.()
  }, [])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-surface p-6 text-ink shadow-2xl ring-1 ring-line backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="modal-title" className="text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="rounded-lg px-2 py-1 text-ink-faint hover:bg-surface-muted hover:text-ink"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
      {children}
    </dialog>
  )
}
