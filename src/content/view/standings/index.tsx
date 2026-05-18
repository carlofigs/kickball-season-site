import { useMemo } from 'react'
import type { SeasonData } from '../../../types/schedule'
import { computeStandings } from '../../../utils/standings'
import { StandingsTable } from './standings_table'

type Props = {
  data: SeasonData
}

/** Maps raw division keys to friendly display labels. */
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

  if (divisions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        No divisions configured for this season.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {divisions.map((div) => {
        const rows = standings[div] ?? []
        return (
          <section key={div} aria-labelledby={`standings-${div}`}>
            {/* Division heading */}
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

      {/* Legend */}
      <p className="text-[0.7rem] text-slate-400 text-right">
        W = Won · D = Drawn · L = Lost · RS = Runs Scored
      </p>
    </div>
  )
}
