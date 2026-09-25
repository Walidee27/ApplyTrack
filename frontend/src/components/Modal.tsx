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
      className="m-auto w-[calc(100%-2rem)] max-w-lg border border-line-strong bg-surface p-6 text-ink backdrop:bg-black/70"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="modal-title" className="text-3xl font-extrabold uppercase" style={{ fontStretch: '75%' }}>
          {title}
        </h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="px-2 py-1 font-mono text-ink-faint hover:text-brand"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
      {children}
    </dialog>
  )
}
