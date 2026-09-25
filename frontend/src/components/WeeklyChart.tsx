import { useState } from 'react'
import type { WeeklyCount } from '../api/types'
import { niceTicks } from '../lib/chart'

const CHART_HEIGHT = 200

const weekLabel = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

/**
 * Histogramme des candidatures envoyées par semaine : une seule série, donc pas de légende
 * (le titre suffit). Survol = infobulle ; la valeur n'est inscrite que sur la semaine la plus haute.
 */
export function WeeklyChart({ weeks }: { weeks: WeeklyCount[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)

  const max = Math.max(...weeks.map((w) => w.count), 0)
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  const peakIndex = max > 0 ? weeks.findIndex((w) => w.count === max) : -1

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-3xl font-extrabold uppercase" style={{ fontStretch: '75%' }}>
          Départs par semaine
        </h2>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="font-mono text-xs tracking-wider text-brand uppercase hover:underline"
        >
          {showTable ? 'Voir le graphique' : 'Voir en tableau'}
        </button>
      </div>

      {showTable ? (
        <table className="mt-4 w-full font-mono text-sm">
          <thead>
            <tr className="text-left text-ink-muted">
              <th className="py-1 font-medium">Semaine du</th>
              <th className="py-1 text-right font-medium">Candidatures</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.weekStart} className="border-t border-line">
                <td className="py-1">{weekLabel(week.weekStart)}</td>
                <td className="py-1 text-right tabular-nums">{week.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // mt-6 : place pour la valeur inscrite au-dessus de la barre la plus haute
        <div className="mt-6 flex gap-2">
          {/* Axe vertical : graduations arrondies */}
          <div className="relative w-6 shrink-0 text-right font-mono text-xs text-ink-faint" style={{ height: CHART_HEIGHT }}>
            {ticks.map((tick) => (
              <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ bottom: (tick / top) * CHART_HEIGHT }}>
                {tick}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative" style={{ height: CHART_HEIGHT }}>
              {/* Grille : filets fins et discrets */}
              {ticks.map((tick) => (
                <div
                  key={tick}
                  className="absolute inset-x-0 border-t border-line"
                  style={{ bottom: (tick / top) * CHART_HEIGHT }}
                />
              ))}

              <div className="absolute inset-0 flex items-end">
                {weeks.map((week, index) => {
                  const height = (week.count / top) * CHART_HEIGHT
                  const isHovered = hovered === index
                  return (
                    // La zone de survol couvre toute la colonne, pas seulement la barre
                    <div
                      key={week.weekStart}
                      className="relative flex h-full flex-1 items-end justify-center"
                      onMouseEnter={() => setHovered(index)}
                      onMouseLeave={() => setHovered(null)}
                      tabIndex={0}
                      onFocus={() => setHovered(index)}
                      onBlur={() => setHovered(null)}
                      aria-label={`Semaine du ${weekLabel(week.weekStart)} : ${week.count} candidature${week.count > 1 ? 's' : ''}`}
                    >
                      {index === peakIndex && (
                        <span className="absolute font-mono text-xs font-bold text-brand tabular-nums" style={{ bottom: height + 4 }}>
                          {week.count}
                        </span>
                      )}
                      <div
                        className={`w-full max-w-6 ${index === weeks.length - 1 ? 'bg-brand' : isHovered ? 'bg-ink' : 'bg-ink-muted'}`}
                        style={{ height: week.count > 0 ? Math.max(height, 2) : 0 }}
                      />
                      {isHovered && (
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute z-10 w-max -translate-x-1/2 bg-ink px-2.5 py-1.5 font-mono text-xs text-canvas shadow-lg"
                          style={{ bottom: height + 24, left: '50%' }}
                        >
                          <span className="block opacity-70">Semaine du {weekLabel(week.weekStart)}</span>
                          <span className="font-bold tabular-nums">
                            {week.count} candidature{week.count > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Axe horizontal : une étiquette sur deux pour éviter les chevauchements */}
            <div className="mt-2 flex border-t border-line-strong pt-1.5">
              {weeks.map((week, index) => (
                <span
                  key={week.weekStart}
                  className={`flex-1 text-center font-mono text-[10px] sm:text-[11px] ${index === weeks.length - 1 ? 'text-brand' : 'text-ink-faint'}`}
                >
                  {index === weeks.length - 1 ? 'AUJ.' : index % 2 === weeks.length % 2 ? '' : weekLabel(week.weekStart)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
