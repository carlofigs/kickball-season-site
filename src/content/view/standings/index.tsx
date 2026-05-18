import { useMemo, useState, useEffect } from 'react'
import type { SeasonData } from '../../../types/schedule'
import { computeStandings } from '../../../utils/standings'
import { StandingsTable } from './standings_table'

type Props = {
  data: SeasonData
}

function divisionLabel(div: string): string {
  if (div === 'Div1') return 'Elphaba'
  if (div === 'Div2') return 'Glinda'
  return div
}

export function StandingsView({ data }: Props) {
  const { season, teams, games, scores } = data

  const standings = useMemo(
    () => computeStandings(games, scores, teams, season.divisions),
    [games, scores, teams, season.divisions],
  )

  const divisions = season.divisions
  const [activeDiv, setActiveDiv] = useState<string>(divisions[0] ?? '')

  // Scroll spy — update active chip as sections enter the viewport
  useEffect(() => {
    if (divisions.length <= 1) return
    const observers: IntersectionObserver[] = []
    for (const div of divisions) {
      const el = document.getElementById(`section-${div}`)
      if (!el) continue
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveDiv(div) },
        // Trigger when section crosses the top quarter of the viewport
        { rootMargin: '-10% 0px -80% 0px', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    }
    return () => observers.forEach(o => o.disconnect())
  }, [divisions])

  function jumpTo(div: string) {
    document.getElementById(`section-${div}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (divisions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        No divisions configured for this season.
      </p>
    )
  }

  return (
    <div>
      {/* Jump links — sticky below the tab bar; only rendered with 2+ divisions */}
      {divisions.length > 1 && (
        <div className="sticky top-[44px] z-9 -mx-4 border-b border-slate-100 bg-white/95 px-4 py-2 backdrop-blur-sm">
          <div className="flex gap-2 overflow-x-auto">
            {divisions.map(div => {
              const active = div === activeDiv
              return (
                <button
                  key={div}
                  onClick={() => jumpTo(div)}
                  className={[
                    'shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700',
                  ].join(' ')}
                >
                  {divisionLabel(div)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Division tables */}
      <div className="mt-6 space-y-8">
        {divisions.map((div) => {
          const rows = standings[div] ?? []
          return (
            <section
              key={div}
              id={`section-${div}`}
              aria-labelledby={`standings-${div}`}
              style={{ scrollMarginTop: '96px' }}
            >
              <div className="mb-3 flex items-baseline gap-3">
                <h2
                  id={`standings-${div}`}
                  className="text-base font-bold text-slate-800"
                >
                  {divisionLabel(div)}
                </h2>
                <span className="text-xs font-medium text-slate-400">
                  {rows.length} {rows.length === 1 ? 'team' : 'teams'}
                </span>
              </div>

              {rows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                  No teams in this division.
                </p>
              ) : (
                <StandingsTable rows={rows} />
              )}
            </section>
          )
        })}

        <p className="text-[0.7rem] text-slate-400 text-right">
          W = Won · D = Drawn · L = Lost · RS = Runs Scored
        </p>
      </div>
    </div>
  )
}
