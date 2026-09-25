import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { APPLICATION_STATUSES, type ApplicationStatus, type JobApplication } from '../api/types'
import { STATUS_COLORS, STATUS_LABELS, groupByStatus, isApplicationStatus } from '../lib/status'
import { ApplicationCard } from './ApplicationCard'

interface KanbanBoardProps {
  applications: JobApplication[]
  /** Délai (en jours) au-delà duquel une candidature sans réponse est signalée « À relancer » */
  followUpAfterDays: number
  onMove: (id: number, status: ApplicationStatus) => void
  onEdit: (application: JobApplication) => void
}

export function KanbanBoard({ applications, followUpAfterDays, onMove, onEdit }: KanbanBoardProps) {
  // Souris : distance minimale pour qu'un clic ne déclenche pas de glisser-déposer.
  // Tactile : appui long, pour que le doigt puisse encore faire défiler le tableau.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )
  const columns = groupByStatus(applications)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || !isApplicationStatus(over.id)) return
    const application = applications.find((a) => a.id === active.id)
    if (application && application.status !== over.id) onMove(application.id, over.id)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* Colonnes de largeur minimale fixe : sur petit écran, le tableau défile horizontalement,
          colonne par colonne sur mobile */}
      <div className="-mx-4 grid snap-x snap-mandatory auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:snap-none sm:auto-cols-[minmax(15rem,1fr)] sm:px-0">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={columns[status]}
            followUpAfterDays={followUpAfterDays}
            onEdit={onEdit}
          />
        ))}
      </div>
    </DndContext>
  )
}

interface KanbanColumnProps {
  status: ApplicationStatus
  applications: JobApplication[]
  /** Délai (en jours) au-delà duquel une candidature sans réponse est signalée « À relancer » */
  followUpAfterDays: number
  onEdit: (application: JobApplication) => void
}

function KanbanColumn({ status, applications, followUpAfterDays, onEdit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <section
      ref={setNodeRef}
      aria-label={STATUS_LABELS[status]}
      className={`min-h-72 snap-start rounded-2xl p-3 transition-colors ${isOver ? 'bg-brand-soft ring-2 ring-brand' : 'bg-surface-muted'}`}
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} aria-hidden="true" />
        <h2 className="text-sm font-semibold">{STATUS_LABELS[status]}</h2>
        <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-muted ring-1 ring-line">
          {applications.length}
        </span>
      </header>
      <div className="space-y-2">
        {applications.length === 0 && (
          <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-ink-faint">
            Glisse une carte ici
          </p>
        )}
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            followUpAfterDays={followUpAfterDays}
            onEdit={onEdit}
          />
        ))}
      </div>
    </section>
  )
}
