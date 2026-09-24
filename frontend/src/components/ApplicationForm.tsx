import { useState, type FormEvent } from 'react'
import { APPLICATION_STATUSES, type JobApplication, type JobApplicationInput } from '../api/types'
import { STATUS_LABELS } from '../lib/status'
import { TextField } from './TextField'

interface ApplicationFormProps {
  initial?: JobApplication
  isSaving: boolean
  fieldErrors?: Record<string, string>
  onSubmit: (input: JobApplicationInput) => void
  onDelete?: () => void
  onCancel: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

export function ApplicationForm({ initial, isSaving, fieldErrors = {}, onSubmit, onDelete, onCancel }: ApplicationFormProps) {
  const [form, setForm] = useState({
    company: initial?.company ?? '',
    title: initial?.title ?? '',
    location: initial?.location ?? '',
    jobUrl: initial?.jobUrl ?? '',
    status: initial?.status ?? 'APPLIED',
    appliedOn: initial?.appliedOn ?? today(),
    notes: initial?.notes ?? '',
  })

  const update = (field: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    // Les champs facultatifs vides sont envoyés à null plutôt qu'en chaîne vide
    onSubmit({
      ...form,
      location: form.location.trim() || null,
      jobUrl: form.jobUrl.trim() || null,
      notes: form.notes.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Entreprise" name="company" value={form.company} onChange={update('company')} error={fieldErrors.company} required />
        <TextField label="Poste" name="title" value={form.title} onChange={update('title')} error={fieldErrors.title} required />
        <TextField label="Lieu" name="location" value={form.location} onChange={update('location')} error={fieldErrors.location} />
        <TextField label="Date de candidature" name="appliedOn" type="date" value={form.appliedOn} onChange={update('appliedOn')} error={fieldErrors.appliedOn} required />
      </div>
      <TextField label="Lien de l'offre" name="jobUrl" type="url" value={form.jobUrl} onChange={update('jobUrl')} error={fieldErrors.jobUrl} />

      <label htmlFor="status" className="block text-sm font-medium text-slate-700">
        Statut
        <select
          id="status"
          value={form.status}
          onChange={update('status')}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
        Notes
        <textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={update('notes')}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </label>

      <div className="flex items-center gap-2 pt-2">
        {onDelete && (
          <button type="button" onClick={onDelete} className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
            Supprimer
          </button>
        )}
        <button type="button" onClick={onCancel} className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {isSaving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
