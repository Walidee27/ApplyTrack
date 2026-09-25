import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError } from '../api/client'
import { applicationsApi } from '../api/endpoints'
import type { ApplicationStatus, JobApplication, JobApplicationInput } from '../api/types'
import { useAuth } from '../auth/useAuth'
import { ApplicationForm } from '../components/ApplicationForm'
import { KanbanBoard } from '../components/KanbanBoard'
import { Modal } from '../components/Modal'
import { Button, Card, PlaneIcon, Spinner } from '../components/ui'
import { STATUS_LABELS, daysSince, needsFollowUp } from '../lib/status'
import { toast } from '../lib/toast'

const QUERY_KEY = ['applications']

type Editing = { mode: 'create' } | { mode: 'edit'; application: JobApplication } | null

export function BoardPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Editing>(null)

  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: applicationsApi.list,
  })

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: ['stats'] }),
    ])

  // Mise à jour optimiste : la carte change de colonne immédiatement, on annule si le back refuse
  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      applicationsApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const previous = queryClient.getQueryData<JobApplication[]>(QUERY_KEY)
      queryClient.setQueryData<JobApplication[]>(QUERY_KEY, (current = []) =>
        current.map((a) => (a.id === id ? { ...a, status } : a)),
      )
      return { previous }
    },
    onSuccess: (updated) => toast(`${updated.company} → ${STATUS_LABELS[updated.status]}`),
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous)
      toast("Le changement de statut n'a pas pu être enregistré", 'error')
    },
    onSettled: invalidate,
  })

  const saveMutation = useMutation({
    mutationFn: (input: JobApplicationInput) =>
      editing?.mode === 'edit'
        ? applicationsApi.update(editing.application.id, input)
        : applicationsApi.create(input),
    onSuccess: (saved) => {
      toast(editing?.mode === 'edit' ? 'Candidature mise à jour' : `Candidature ${saved.company} ajoutée`)
      setEditing(null)
      invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.remove(id),
    onError: () => toast('La suppression a échoué', 'error'),
    onSuccess: () => {
      toast('Candidature supprimée')
      setEditing(null)
      invalidate()
    },
  })

  const closeModal = () => {
    setEditing(null)
    saveMutation.reset()
  }

  const saveError = saveMutation.error instanceof ApiError ? saveMutation.error : null
  const followUpAfterDays = user?.reminderAfterDays ?? 7
  // Candidatures « retardées », de la plus ancienne à la plus récente, pour le bandeau INFO TRAFIC
  const delayed = applications
    .filter((a) => needsFollowUp(a, followUpAfterDays))
    .map((a) => ({ company: a.company, days: daysSince(a.statusChangedAt) }))
    .sort((a, b) => b.days - a.days)

  return (
    <div>
      {delayed.length > 0 && (
        <div
          role="status"
          className="-mx-4 flex flex-wrap items-center gap-x-5 gap-y-1 bg-brand px-4 py-2.5 font-mono text-xs text-on-brand sm:-mx-8 sm:px-8"
        >
          <span className="font-bold tracking-wider">INFO TRAFIC</span>
          <span>
            {delayed.length} candidature{delayed.length > 1 ? 's' : ''} retardée{delayed.length > 1 ? 's' : ''} ·{' '}
            {delayed
              .slice(0, 4)
              .map((d) => `${d.company} ${d.days} j`)
              .join(' · ')}
            {delayed.length > 4 ? ' · …' : ''} · pense à relancer
          </span>
        </div>
      )}

      <header className="flex flex-wrap items-end gap-4 pt-8 pb-6">
        <div>
          <p className="board-label text-ink-faint">Terminal personnel</p>
          <h1 className="mt-1.5 board-title text-6xl sm:text-7xl">
            Départs <span className="text-ink-faint">{String(applications.length).padStart(2, '0')}</span>
          </h1>
        </div>
        <Button onClick={() => setEditing({ mode: 'create' })} size="lg" className="ml-auto" title="Ajouter une candidature">
          + Nouveau vol
        </Button>
      </header>

      {isLoading && (
        <p className="flex items-center gap-2 font-mono text-sm text-ink-muted">
          <Spinner /> Chargement du tableau…
        </p>
      )}
      {isError && (
        <p role="alert" className="border border-danger bg-danger-soft px-4 py-3 font-mono text-sm text-danger">
          Impossible de charger les candidatures.
        </p>
      )}
      {!isLoading && !isError && applications.length === 0 && (
        <Card className="mx-auto max-w-lg px-6 py-12 text-center">
          <PlaneIcon className="mx-auto h-10 w-10" />
          <h2 className="mt-5 text-3xl font-extrabold uppercase" style={{ fontStretch: '75%' }}>
            Aucun départ prévu
          </h2>
          <p className="mt-3 text-ink-muted">
            Ajoute ta première candidature : elle apparaîtra dans la colonne « Envoyées », prête à décoller.
          </p>
          <Button onClick={() => setEditing({ mode: 'create' })} size="lg" className="mt-8">
            + Ajouter une candidature
          </Button>
        </Card>
      )}
      {!isLoading && !isError && applications.length > 0 && (
        <KanbanBoard
          applications={applications}
          followUpAfterDays={followUpAfterDays}
          onMove={(id, status) => moveMutation.mutate({ id, status })}
          onEdit={(application) => setEditing({ mode: 'edit', application })}
        />
      )}

      {editing && (
        <Modal title={editing.mode === 'edit' ? 'Modifier la candidature' : 'Nouvelle candidature'} onClose={closeModal}>
          <ApplicationForm
            initial={editing.mode === 'edit' ? editing.application : undefined}
            isSaving={saveMutation.isPending}
            fieldErrors={saveError?.fieldErrors}
            onSubmit={(input) => saveMutation.mutate(input)}
            onDelete={editing.mode === 'edit' ? () => deleteMutation.mutate(editing.application.id) : undefined}
            onCancel={closeModal}
          />
          {saveError && Object.keys(saveError.fieldErrors).length === 0 && (
            <p role="alert" className="mt-3 border border-danger bg-danger-soft px-3 py-2 font-mono text-sm text-danger">{saveError.message}</p>
          )}
        </Modal>
      )}
    </div>
  )
}
