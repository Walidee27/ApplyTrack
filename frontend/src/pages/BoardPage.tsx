import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError } from '../api/client'
import { applicationsApi } from '../api/endpoints'
import type { ApplicationStatus, JobApplication, JobApplicationInput } from '../api/types'
import { useAuth } from '../auth/useAuth'
import { ApplicationForm } from '../components/ApplicationForm'
import { KanbanBoard } from '../components/KanbanBoard'
import { Modal } from '../components/Modal'

const QUERY_KEY = ['applications']

type Editing = { mode: 'create' } | { mode: 'edit'; application: JobApplication } | null

export function BoardPage() {
  const { user, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Editing>(null)

  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: applicationsApi.list,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

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
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous)
    },
    onSettled: invalidate,
  })

  const saveMutation = useMutation({
    mutationFn: (input: JobApplicationInput) =>
      editing?.mode === 'edit'
        ? applicationsApi.update(editing.application.id, input)
        : applicationsApi.create(input),
    onSuccess: () => {
      setEditing(null)
      invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.remove(id),
    onSuccess: () => {
      setEditing(null)
      invalidate()
    },
  })

  const closeModal = () => {
    setEditing(null)
    saveMutation.reset()
  }

  const saveError = saveMutation.error instanceof ApiError ? saveMutation.error : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mes candidatures</h1>
          <p className="text-sm text-slate-500">
            Bonjour {user?.displayName} · {applications.length} candidature{applications.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ mode: 'create' })}
          className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + Nouvelle candidature
        </button>
        <button type="button" onClick={signOut} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
          Déconnexion
        </button>
      </header>

      {isLoading && <p className="text-slate-500">Chargement…</p>}
      {isError && <p role="alert" className="text-rose-600">Impossible de charger les candidatures.</p>}
      {!isLoading && !isError && (
        <KanbanBoard
          applications={applications}
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
            <p role="alert" className="mt-3 text-sm text-rose-600">{saveError.message}</p>
          )}
        </Modal>
      )}
    </div>
  )
}
