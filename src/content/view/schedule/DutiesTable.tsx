import { Wrench, Package, Flag } from 'lucide-react'
import type { SeasonData } from '../../../types/schedule'
import { teamKey } from './_helpers'

export type DutyTeam = { color: string; division: string | null }

type Props = {
  setupTeams: DutyTeam[]
  packdownTeams: DutyTeam[]
  lineRefByTime: Array<[string, DutyTeam[]]>
  setupTime: string | null
  packdownTime: string | null
  teams: SeasonData['teams']
}

function TeamCell({ items, teams }: { items: DutyTeam[]; teams: SeasonData['teams'] }) {
  if (!items.length) return <td className="px-3 py-2 text-xs text-slate-300">—</td>
  return (
    <td className="px-3 py-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map(({ color, division }) => {
          const hex = teams[teamKey(color, division)]?.color_hex ?? '#94a3b8'
          return (
            <span key={teamKey(color, division)} className="inline-flex items-center gap-1 text-xs text-slate-600">
              <span
                className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: hex }}
              />
              {color}
            </span>
          )
        })}
      </div>
    </td>
  )
}

export function DutiesTable({
  setupTeams, packdownTeams, lineRefByTime,
  setupTime, packdownTime, teams,
}: Props) {
  const hasAny = setupTeams.length > 0 || packdownTeams.length > 0 || lineRefByTime.length > 0
  if (!hasAny) return null

  return (
    <div>
      <p className="mb-1.5 text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
        Team Duties
      </p>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-3 py-2 text-left text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                Duty
              </th>
              <th className="px-3 py-2 text-left text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                Time
              </th>
              <th className="px-3 py-2 text-left text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
                Teams
              </th>
            </tr>
          </thead>
          <tbody>
            {setupTeams.length > 0 && (
              <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Wrench className="size-3 text-green-500" /> Setup
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-500 whitespace-nowrap">
                  {setupTime ?? '—'}
                </td>
                <TeamCell items={setupTeams} teams={teams} />
              </tr>
            )}
            {packdownTeams.length > 0 && (
              <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Package className="size-3 text-amber-500" /> Pack Down
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-500 whitespace-nowrap">
                  {packdownTime ?? '—'}
                </td>
                <TeamCell items={packdownTeams} teams={teams} />
              </tr>
            )}
            {lineRefByTime.map(([time, colors]) => (
              <tr key={time} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Flag className="size-3 text-slate-400" /> Line Ref
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-500 whitespace-nowrap">{time}</td>
                <TeamCell items={colors} teams={teams} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
