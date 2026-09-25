import { useDraggable } from '@dnd-kit/core'
import type { JobApplication } from '../api/types'
import { daysSince, needsFollowUp } from '../lib/status'

interface ApplicationCardProps {
  application: JobApplication
  followUpAfterDays: number
  onEdit: (application: JobApplication) => void
}

export function ApplicationCard({ application, followUpAfterDays, onEdit }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  })
  const days = daysSince(application.statusChangedAt)
  const toFollowUp = needsFollowUp(application, followUpAfterDays)

  return (
    <article
      ref={setNodeRef}
      style={transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined}
      className={`cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 active:cursor-grabbing ${
        toFollowUp ? 'ring-amber-300' : 'ring-slate-200'
      } ${isDragging ? 'z-10 opacity-80 shadow-lg' : ''}`}
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
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        {toFollowUp && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800 ring-1 ring-amber-200">
            <span aria-hidden="true">⏰</span> À relancer
          </span>
        )}
        <span>
          {application.location ? `${application.location} · ` : ''}
          {days === 0 ? "Mis à jour aujourd'hui" : `Sans changement depuis ${days} j`}
        </span>
      </div>
    </article>
  )
}
