import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { authApi } from '../api/endpoints'
import type { User } from '../api/types'

interface PreferencesFormProps {
  user: User
  onSaved: (user: User) => void
  onCancel: () => void
}

const DELAY_OPTIONS = [3, 5, 7, 10, 14, 21, 30]

export function PreferencesForm({ user, onSaved, onCancel }: PreferencesFormProps) {
  const [remindersEnabled, setRemindersEnabled] = useState(user.remindersEnabled)
  const [reminderAfterDays, setReminderAfterDays] = useState(user.reminderAfterDays)

  const mutation = useMutation({
    mutationFn: () => authApi.updatePreferences({ remindersEnabled, reminderAfterDays }),
    onSuccess: onSaved,
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate()
  }

  // L'utilisateur peut avoir un délai hors liste (fixé via l'API) : on l'ajoute pour ne pas le perdre
  const options = DELAY_OPTIONS.includes(reminderAfterDays)
    ? DELAY_OPTIONS
    : [...DELAY_OPTIONS, reminderAfterDays].sort((a, b) => a - b)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={remindersEnabled}
          onChange={(event) => setRemindersEnabled(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
        />
        <span>
          <span className="block text-sm font-medium text-slate-800">Recevoir un e-mail de relance</span>
          <span className="block text-sm text-slate-500">
            Un récapitulatif chaque matin des candidatures restées sans réponse, envoyé à {user.email}.
          </span>
        </span>
      </label>

      <label htmlFor="reminderAfterDays" className="block text-sm font-medium text-slate-700">
        Considérer une candidature « à relancer » après
        <select
          id="reminderAfterDays"
          value={reminderAfterDays}
          onChange={(event) => setReminderAfterDays(Number(event.target.value))}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {options.map((days) => (
            <option key={days} value={days}>
              {days} jours sans nouvelles
            </option>
          ))}
        </select>
      </label>

      {mutation.error instanceof ApiError && (
        <p role="alert" className="text-sm text-rose-700">
          {mutation.error.message}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Annuler
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
