import { useMemo, useState } from 'react'
import type { SeasonData } from '../../../types/schedule'
import { computeStandings } from '../../../utils/standings'
import { StandingsTable } from './standings_table'

type Props = {
  data: SeasonData
}

function divisionLabel(div: string): string {
  if (div === 'Div1') return 'Elphaba'
  if (div === 'Div2') return 'Glinda'
  if (div === 'Guardians') return 'Guardians'
  return div
}

export function StandingsView({ data }: Props) {
  const { season, teams, games, scores } = data

  const standings = useMemo(
    () => computeStandings(games, scores, teams, season.divisions),
    [games, scores, teams, season.divisions],
  )

  const divisions = season.divisions
  const [activeIndex, setActiveIndex] = useState(0)

  if (divisions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        No divisions configured for this season.
      </p>
    )
  }

  function DivisionBlock({ div }: { div: string }) {
    const rows = standings[div] ?? []
    return (
      <div className="flex-1 min-w-0">
        <div className="mb-3 hidden sm:flex items-baseline gap-3">
          <h2 className="text-base font-bold text-slate-800">{divisionLabel(div)}</h2>
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
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* ── Mobile: tab buttons + single division ── */}
      <div className="sm:hidden space-y-4">
        {divisions.length > 1 && (
          <div className="flex gap-2">
            {divisions.map((div, i) => (
              <button
                key={div}
                onClick={() => setActiveIndex(i)}
                className={[
                  'flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500',
                  i === activeIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700',
                ].join(' ')}
              >
                {divisionLabel(div)}
              </button>
            ))}
          </div>
        )}
        <DivisionBlock div={divisions[activeIndex]} />
      </div>

      {/* ── Desktop: all divisions side by side ── */}
      <div className="hidden sm:flex gap-5">
        {divisions.map(div => (
          <DivisionBlock key={div} div={div} />
        ))}
      </div>

      {/* Legend */}
      <p className="text-[0.7rem] text-slate-400 text-right">
        W = Won · D = Drawn · L = Lost · RS = Runs Scored
      </p>

    </div>
  )
}
