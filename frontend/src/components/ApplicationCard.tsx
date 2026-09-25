import { useDraggable } from '@dnd-kit/core'
import type { JobApplication } from '../api/types'
import { daysSince, needsFollowUp } from '../lib/status'
import { ApplicationCardView } from './ApplicationCardView'

interface ApplicationCardProps {
  application: JobApplication
  followUpAfterDays: number
  onEdit: (application: JobApplication) => void
}

export function ApplicationCard({ application, followUpAfterDays, onEdit }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  })

  return (
    <article
      ref={setNodeRef}
      style={transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'relative z-10 opacity-90' : ''}`}
      {...listeners}
      {...attributes}
    >
      <ApplicationCardView
        company={application.company}
        title={application.title}
        location={application.location}
        days={daysSince(application.statusChangedAt)}
        toFollowUp={needsFollowUp(application, followUpAfterDays)}
        highlighted={isDragging}
        action={
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onEdit(application)}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-ink-faint hover:bg-surface-muted hover:text-ink"
            aria-label={`Modifier la candidature ${application.company}`}
          >
            Modifier
          </button>
        }
      />
    </article>
  )
}
