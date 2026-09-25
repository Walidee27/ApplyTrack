import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError } from '../api/client'
import { applicationsApi } from '../api/endpoints'
import type { ApplicationStatus, JobApplication, JobApplicationInput } from '../api/types'
import { useAuth } from '../auth/useAuth'
import { ApplicationForm } from '../components/ApplicationForm'
import { KanbanBoard } from '../components/KanbanBoard'
import { Modal } from '../components/Modal'
import { Button, Card, Spinner } from '../components/ui'
import { STATUS_LABELS, needsFollowUp } from '../lib/status'
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
  const toFollowUpCount = applications.filter((a) => needsFollowUp(a, followUpAfterDays)).length

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes candidatures</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {applications.length} candidature{applications.length > 1 ? 's' : ''}
            {toFollowUpCount > 0 && ` · ${toFollowUpCount} à relancer`}
          </p>
        </div>
        <Button onClick={() => setEditing({ mode: 'create' })} className="ml-auto">
          + Nouvelle candidature
        </Button>
      </header>

      {isLoading && (
        <p className="flex items-center gap-2 text-ink-muted">
          <Spinner /> Chargement…
        </p>
      )}
      {isError && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          Impossible de charger les candidatures.
        </p>
      )}
      {!isLoading && !isError && applications.length === 0 && (
        <Card className="mx-auto max-w-lg px-6 py-12 text-center">
          <span className="text-4xl" aria-hidden="true">📋</span>
          <h2 className="mt-4 text-lg font-semibold">Ton tableau est vide</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Ajoute ta première candidature : elle apparaîtra dans la colonne « Envoyée », prête à être suivie.
          </p>
          <Button onClick={() => setEditing({ mode: 'create' })} className="mt-6">
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
            <p role="alert" className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{saveError.message}</p>
          )}
        </Modal>
      )}
    </div>
  )
}
