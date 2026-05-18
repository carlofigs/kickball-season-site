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

export function StandingsTable({ rows }: Props) {
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
              P
            </th>
            <th className="px-2 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              W
            </th>
            <th className="hidden px-2 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 sm:table-cell">
              D
            </th>
            <th className="hidden px-2 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 sm:table-cell">
              L
            </th>
            <th className="px-2 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
              Pts
            </th>
            <th className="px-3 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              RS
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const pos = index + 1
            const rowBg = POSITION_ROW_BG[pos] ?? (index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')

            return (
              <tr
                key={row.teamColor}
                className={`border-b border-slate-100 last:border-0 ${rowBg}`}
              >
                {/* Position */}
                <td className={`px-3 py-2.5 text-right text-xs tabular-nums ${POSITION_STYLES[pos] ?? 'text-slate-400 font-medium'}`}>
                  {pos}
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

                {/* Played */}
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-600">
                  {row.played}
                </td>

                {/* Won */}
                <td className="px-2 py-2.5 text-center tabular-nums font-medium text-slate-700">
                  {row.won}
                </td>

                {/* Drawn — hidden on mobile */}
                <td className="hidden px-2 py-2.5 text-center tabular-nums text-slate-500 sm:table-cell">
                  {row.drawn}
                </td>

                {/* Lost — hidden on mobile */}
                <td className="hidden px-2 py-2.5 text-center tabular-nums text-slate-500 sm:table-cell">
                  {row.lost}
                </td>

                {/* Points — highlighted */}
                <td className="px-2 py-2.5 text-center tabular-nums font-bold text-slate-900">
                  {row.points}
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
