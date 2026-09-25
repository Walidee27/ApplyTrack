import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { statsApi } from '../api/endpoints'
import { APPLICATION_STATUSES, type Stats } from '../api/types'
import { WeeklyChart } from '../components/WeeklyChart'
import { STATUS_COLORS, STATUS_LABELS } from '../lib/status'

const percent = (ratio: number) => `${Math.round(ratio * 100)} %`

export function StatsPage() {
  const { data: stats, isLoading, isError } = useQuery({ queryKey: ['stats'], queryFn: statsApi.get })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Statistiques</h1>

      {isLoading && <p className="text-ink-muted">Chargement…</p>}
      {isError && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">Impossible de charger les statistiques.</p>}
      {stats && stats.total === 0 && (
        <div className="rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-line">
          <p className="font-medium">Pas encore de statistiques</p>
          <p className="mt-1 text-sm text-ink-muted">
            Ajoute tes premières candidatures depuis le{' '}
            <Link to="/app" className="font-medium text-brand hover:underline">
              tableau
            </Link>
            .
          </p>
        </div>
      )}
      {stats && stats.total > 0 && <StatsContent stats={stats} />}
    </div>
  )
}

function StatsContent({ stats }: { stats: Stats }) {
  const average = stats.averageResponseDays
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile label="Candidatures" value={String(stats.total)} />
        <StatTile label="Taux de réponse" value={percent(stats.responseRate)} hint="Entretien, offre ou refus" />
        <StatTile label="Taux d'entretien" value={percent(stats.interviewRate)} hint="Entretien ou offre" />
        <StatTile
          label="Délai moyen de réponse"
          value={average === null ? '—' : `${average.toFixed(1).replace('.', ',')} j`}
          hint={average === null ? 'Aucune réponse pour l’instant' : 'Entre l’envoi et la première réponse'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line lg:col-span-2">
          <WeeklyChart weeks={stats.weekly} />
        </section>
        <section className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line">
          <StatusBreakdown stats={stats} />
        </section>
      </div>
    </div>
  )
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  )
}

/** Répartition actuelle par statut : chaque barre porte son libellé et sa valeur (jamais la couleur seule). */
function StatusBreakdown({ stats }: { stats: Stats }) {
  const max = Math.max(...APPLICATION_STATUSES.map((s) => stats.byStatus[s]), 1)
  return (
    <div>
      <h2 className="mb-4 font-semibold">Où en sont mes candidatures</h2>
      <ul className="space-y-3">
        {APPLICATION_STATUSES.map((status) => {
          const count = stats.byStatus[status]
          return (
            <li key={status} title={`${STATUS_LABELS[status]} : ${count} (${percent(count / stats.total)})`}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} aria-hidden="true" />
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-ink-muted tabular-nums">
                  {count} · {percent(count / stats.total)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-muted">
                <div
                  className={`h-2 rounded-full ${STATUS_COLORS[status]}`}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
