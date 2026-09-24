import { useDraggable } from '@dnd-kit/core'
import type { JobApplication } from '../api/types'
import { daysSince } from '../lib/status'

interface ApplicationCardProps {
  application: JobApplication
  onEdit: (application: JobApplication) => void
}

export function ApplicationCard({ application, onEdit }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  })
  const days = daysSince(application.statusChangedAt)

  return (
    <article
      ref={setNodeRef}
      style={transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined}
      className={`cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 active:cursor-grabbing ${
        isDragging ? 'z-10 opacity-80 shadow-lg' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{application.company}</h3>
          <p className="truncate text-sm text-slate-600">{application.title}</p>
        </div>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onEdit(application)}
          className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
          aria-label={`Modifier la candidature ${application.company}`}
        >
          Modifier
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {application.location ? `${application.location} · ` : ''}
        {days === 0 ? "Mis à jour aujourd'hui" : `Sans changement depuis ${days} j`}
      </p>
    </article>
  )
}
