import { useMemo } from 'react'
import { Wrench, Package, Flag } from 'lucide-react'
import type { SeasonData, DbGame } from '../../../types/schedule'
import { teamKey } from './_helpers'
import { TeamGameCard } from './TeamGameCard'

type Props = {
  teamColor: string
  /** Normalised division from the compound key: 'Open' | 'Guardians' | '' */
  division: string
  gameDays: Array<[number, DbGame[]]>
  teams: SeasonData['teams']
  scores: SeasonData['scores']
}

function DayChip({ n }: { n: number }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600">
      Game {n}
    </span>
  )
}

export function TeamView({ teamColor, division, gameDays, teams, scores }: Props) {
  const team = teams[teamKey(teamColor, division)]
  const hex = team?.color_hex ?? '#94a3b8'

  const setupDays = gameDays
    .filter(([, gs]) => gs.some(g => g.field_setup_teams?.includes(teamColor)))
    .map(([n]) => n)
  const packdownDays = gameDays
    .filter(([, gs]) => gs.some(g => g.field_packdown_teams?.includes(teamColor)))
    .map(([n]) => n)
  const lineRefDays = gameDays
    .filter(([, gs]) => gs.some(g => g.line_ref_teams?.includes(teamColor)))
    .map(([n]) => n)

  const myGames = useMemo(() =>
    gameDays.flatMap(([, gs]) => gs.filter(g =>
      (g.team_a === teamColor || g.team_b === teamColor) &&
      (!division || g.division === division),
    )),
    [gameDays, teamColor, division],
  )

  return (
    <div className="space-y-6">
      {/* Your team card */}
      <div
        className="rounded-xl border overflow-hidden bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
        style={{ borderColor: `${hex}40` }}
      >
        <div className="h-1.5" style={{ backgroundColor: hex }} />
        <div className="p-4 space-y-3">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">Your Team</p>
          <p className="text-base font-extrabold text-slate-800">
            {team?.emoji && <span className="mr-1.5">{team.emoji}</span>}
            {team?.display_name ?? teamColor}
          </p>

          {(setupDays.length > 0 || packdownDays.length > 0 || lineRefDays.length > 0) && (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              {setupDays.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Wrench className="size-3.5 text-green-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-600 shrink-0 w-24">Field Setup</span>
                  {setupDays.map(n => <DayChip key={n} n={n} />)}
                </div>
              )}
              {packdownDays.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Package className="size-3.5 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-600 shrink-0 w-24">Pack Down</span>
                  {packdownDays.map(n => <DayChip key={n} n={n} />)}
                </div>
              )}
              {lineRefDays.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Flag className="size-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-600 shrink-0 w-24">Line Ref</span>
                  {lineRefDays.map(n => <DayChip key={n} n={n} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Game cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {myGames.map(game => (
          <TeamGameCard key={game.uuid} game={game} teamColor={teamColor} teams={teams} scores={scores} />
        ))}
      </div>
    </div>
  )
}
