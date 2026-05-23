import type { StandingsRow } from '../../../../types/schedule'

type Props = {
  rows: StandingsRow[]
}

const POSITION_STYLES: Record<number, string> = {
  1: 'text-amber-600 font-bold',
  2: 'text-slate-500 font-semibold',
  3: 'text-amber-700/70 font-semibold',
}

const POSITION_ROW_BG: Record<number, string> = {
  1: 'bg-amber-50/60',
}

/**
 * Dense ranking: tied teams share the same rank; the next distinct team
 * gets the next sequential integer (no skipping).
 * e.g. scores A > B = C > D → ranks 1, 2, 2, 3
 */
function computeRanks(rows: StandingsRow[]): number[] {
  const ranks: number[] = []
  for (let i = 0; i < rows.length; i++) {
    if (i === 0) { ranks.push(1); continue }
    const prev = rows[i - 1]
    const curr = rows[i]
    const tied =
      prev.won === curr.won &&
      prev.drawn === curr.drawn &&
      prev.lost === curr.lost &&
      prev.runsScored === curr.runsScored
    ranks.push(tied ? ranks[i - 1] : ranks[i - 1] + 1)
  }
  return ranks
}

export function StandingsTable({ rows }: Props) {
  // No rankings until at least one game has been played in this division.
  const seasonStarted = rows.some(r => r.played > 0)
  const ranks = computeRanks(rows)

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-900/[0.07] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="w-8 px-3 py-2.5 text-right text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              #
            </th>
            <th className="px-3 py-2.5 text-left text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              Team
            </th>
            <th className="px-2 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              W
            </th>
            <th className="px-2 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              D
            </th>
            <th className="px-2 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              L
            </th>
            <th className="px-3 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              RS
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const rank = ranks[index]
            const rowBg = seasonStarted
              ? (POSITION_ROW_BG[rank] ?? (index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'))
              : (index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')

            return (
              <tr
                key={row.teamColor}
                className={`border-b border-slate-100 last:border-0 ${rowBg}`}
              >
                {/* Position — hidden until season has started */}
                <td className={`px-3 py-2.5 text-right text-xs tabular-nums ${seasonStarted ? (POSITION_STYLES[rank] ?? 'text-slate-400 font-medium') : 'text-slate-300'}`}>
                  {seasonStarted ? rank : '—'}
                </td>

                {/* Team chip */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Color dot */}
                    <span
                      className="shrink-0 size-2.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: row.colorHex }}
                      aria-hidden="true"
                    />
                    {/* Emoji + name */}
                    <span className="truncate font-semibold text-slate-800">
                      {row.emoji && (
                        <span className="mr-1" aria-hidden="true">
                          {row.emoji}
                        </span>
                      )}
                      {row.displayName}
                    </span>
                  </div>
                </td>

                {/* Won */}
                <td className="px-2 py-2.5 text-center tabular-nums font-medium text-slate-700">
                  {row.won}
                </td>

                {/* Drawn */}
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-500">
                  {row.drawn}
                </td>

                {/* Lost */}
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-500">
                  {row.lost}
                </td>

                {/* Runs scored */}
                <td className="px-3 py-2.5 text-center tabular-nums text-slate-500">
                  {row.runsScored}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
