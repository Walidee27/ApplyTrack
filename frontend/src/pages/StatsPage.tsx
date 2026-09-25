import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { statsApi } from '../api/endpoints'
import { APPLICATION_STATUSES, type Stats } from '../api/types'
import { FlapDigits, Spinner } from '../components/ui'
import { WeeklyChart } from '../components/WeeklyChart'
import { STATUS_COLORS, STATUS_FLIGHT_LABELS, STATUS_LABELS } from '../lib/status'

const percentValue = (ratio: number) => String(Math.round(ratio * 100))

export function StatsPage() {
  const { data: stats, isLoading, isError } = useQuery({ queryKey: ['stats'], queryFn: statsApi.get })

  return (
    <div>
      <header className="pt-8 pb-6">
        <p className="board-label text-ink-faint">12 dernières semaines</p>
        <h1 className="mt-1.5 board-title text-6xl sm:text-7xl">Bilan de vol</h1>
      </header>

      {isLoading && (
        <p className="flex items-center gap-2 font-mono text-sm text-ink-muted">
          <Spinner /> Chargement du bilan…
        </p>
      )}
      {isError && (
        <p role="alert" className="border border-danger bg-danger-soft px-4 py-3 font-mono text-sm text-danger">
          Impossible de charger les statistiques.
        </p>
      )}
      {stats && stats.total === 0 && (
        <div className="border border-line bg-surface p-10 text-center">
          <p className="text-3xl font-extrabold uppercase" style={{ fontStretch: '75%' }}>
            Aucun vol enregistré
          </p>
          <p className="mt-3 text-ink-muted">
            Ajoute tes premières candidatures depuis le{' '}
            <Link to="/app" className="font-bold text-brand hover:underline">
              tableau des départs
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
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Vols programmés" hint="candidatures envoyées">
          <FlapDigits value={String(stats.total).padStart(2, '0')} />
        </StatTile>
        <StatTile label="Taux de réponse" hint="entretien, offre ou refus">
          <FlapDigits value={percentValue(stats.responseRate)} unit="%" />
        </StatTile>
        <StatTile label="Taux d'embarquement" hint="entretien ou offre">
          <FlapDigits value={percentValue(stats.interviewRate)} unit="%" />
        </StatTile>
        <StatTile label="Délai moyen de réponse" hint="entre l'envoi et la 1re réponse" highlighted>
          {average === null ? (
            <p className="flex h-14 items-center font-mono text-sm text-ink-muted sm:h-[4.5rem]">Aucune réponse pour l'instant</p>
          ) : (
            <FlapDigits value={average.toFixed(1).replace('.', ',')} unit="J" accent />
          )}
        </StatTile>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="border border-line bg-surface p-6 lg:col-span-2">
          <WeeklyChart weeks={stats.weekly} />
        </section>
        <section className="border border-line bg-surface p-6">
          <StatusBreakdown stats={stats} />
        </section>
      </div>
    </div>
  )
}

function StatTile({ label, hint, highlighted, children }: {
  label: string
  hint: string
  highlighted?: boolean
  children: ReactNode
}) {
  return (
    <div className={`border bg-surface p-5 ${highlighted ? 'border-brand' : 'border-line'}`}>
      <p className={`board-label text-[11px] ${highlighted ? 'text-brand' : 'text-ink-faint'}`}>{label}</p>
      <div className="mt-4">{children}</div>
      <p className="mt-3 font-mono text-xs text-ink-muted">{hint}</p>
    </div>
  )
}

/** Répartition actuelle par statut : chaque barre porte son libellé et sa valeur (jamais la couleur seule). */
function StatusBreakdown({ stats }: { stats: Stats }) {
  const max = Math.max(...APPLICATION_STATUSES.map((s) => stats.byStatus[s]), 1)
  return (
    <div>
      <h2 className="text-3xl font-extrabold uppercase" style={{ fontStretch: '75%' }}>
        État du trafic
      </h2>
      <ul className="mt-5 space-y-4 font-mono text-xs sm:text-sm">
        {APPLICATION_STATUSES.map((status) => {
          const count = stats.byStatus[status]
          const share = `${percentValue(count / stats.total)} %`
          return (
            <li key={status} title={`${STATUS_LABELS[status]} : ${count} (${share})`}>
              <div className="mb-1.5 flex justify-between gap-2 uppercase">
                <span>
                  {STATUS_FLIGHT_LABELS[status]} · {STATUS_LABELS[status]}s
                </span>
                <span className="shrink-0 text-ink-muted tabular-nums">
                  {count} · {share}
                </span>
              </div>
              <div className="h-2 bg-surface-muted">
                <div className={`h-2 ${STATUS_COLORS[status]}`} style={{ width: `${(count / max) * 100}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
