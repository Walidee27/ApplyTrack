import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
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
  // Distance minimale pour qu'un simple clic ne déclenche pas de glisser-déposer
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
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
      {/* Colonnes de largeur minimale fixe : sur petit écran, le tableau défile horizontalement */}
      <div className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-4 overflow-x-auto pb-4">
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
      className={`min-h-64 rounded-2xl p-3 transition-colors ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-slate-100'}`}
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />
        <h2 className="text-sm font-semibold text-slate-700">{STATUS_LABELS[status]}</h2>
        <span className="ml-auto rounded-full bg-white px-2 text-xs font-medium text-slate-500">
          {applications.length}
        </span>
      </header>
      <div className="space-y-2">
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
