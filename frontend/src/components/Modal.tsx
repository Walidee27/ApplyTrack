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
      className="m-auto w-full max-w-lg rounded-2xl p-6 shadow-xl backdrop:bg-slate-900/40"
    >
      <h2 id="modal-title" className="mb-4 text-lg font-semibold">
        {title}
      </h2>
      {children}
    </dialog>
  )
}
