import { useState, useMemo } from 'react'
import type { SeasonData, DbGame } from '../../../types/schedule'

type Props = {
  data: SeasonData
}

// Field display order — matches physical layout
const FIELD_ORDER = ['Road', 'Middle', 'Kiosk', 'Water']

// ─── Team dot ─────────────────────────────────────────────────────────────────

function TeamDot({ colorHex }: { colorHex: string | null }) {
  return (
    <span
      className="shrink-0 size-2 rounded-full ring-1 ring-black/10"
      style={{ backgroundColor: colorHex ?? '#94a3b8' }}
      aria-hidden="true"
    />
  )
}

// ─── Timetable game cell ──────────────────────────────────────────────────────

type GameCellProps = {
  game: DbGame
  teams: SeasonData['teams']
  scores: SeasonData['scores']
  dimmed: boolean
}

function GameCell({ game, teams, scores, dimmed }: GameCellProps) {
  const score = scores[game.uuid]
  const hasScore = score && score.score_a != null && score.score_b != null

  const teamA = game.team_a ? teams[game.team_a] : null
  const teamB = game.team_b ? teams[game.team_b] : null

  const aWon = hasScore && score.score_a! > score.score_b!
  const bWon = hasScore && score.score_b! > score.score_a!

  return (
    <div
      className={[
        'rounded-lg border bg-white px-2.5 py-2 text-xs transition-opacity h-full',
        dimmed ? 'opacity-20' : 'opacity-100',
        hasScore
          ? 'border-slate-900/[0.07] shadow-[0_1px_2px_rgba(15,23,42,0.06)]'
          : 'border-slate-200',
      ].join(' ')}
    >
      {/* Team A */}
      <div className="flex items-center gap-1.5 min-w-0">
        <TeamDot colorHex={teamA?.color_hex ?? null} />
        <span className={[
          'truncate leading-tight',
          aWon ? 'font-bold text-slate-900' : 'font-medium text-slate-700',
        ].join(' ')}>
          {teamA?.display_name ?? game.team_a ?? '—'}
        </span>
        {hasScore && (
          <span className={[
            'ml-auto shrink-0 tabular-nums',
            aWon ? 'font-bold text-slate-900' : 'text-slate-500',
          ].join(' ')}>
            {score.score_a}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="my-1 border-t border-slate-100" />

      {/* Team B */}
      <div className="flex items-center gap-1.5 min-w-0">
        <TeamDot colorHex={teamB?.color_hex ?? null} />
        <span className={[
          'truncate leading-tight',
          bWon ? 'font-bold text-slate-900' : 'font-medium text-slate-700',
        ].join(' ')}>
          {teamB?.display_name ?? game.team_b ?? '—'}
        </span>
        {hasScore && (
          <span className={[
            'ml-auto shrink-0 tabular-nums',
            bWon ? 'font-bold text-slate-900' : 'text-slate-500',
          ].join(' ')}>
            {score.score_b}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Field duties row ─────────────────────────────────────────────────────────

type DutiesRowProps = {
  label: string
  teamColors: string[] | null
  teams: SeasonData['teams']
}

function DutiesRow({ label, teamColors, teams }: DutiesRowProps) {
  if (!teamColors || teamColors.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="shrink-0 font-semibold text-slate-500 w-20">{label}</span>
      <div className="flex flex-wrap gap-2">
        {teamColors.map((color) => {
          const team = teams[color]
          return (
            <span key={color} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: team?.color_hex ?? '#94a3b8' }}
                aria-hidden="true"
              />
              <span className="text-slate-600">
                {team?.emoji ? `${team.emoji} ` : ''}
                {team?.display_name ?? color}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ─── Game day timetable ───────────────────────────────────────────────────────

type GameDayProps = {
  dayNum: number
  games: DbGame[]
  teams: SeasonData['teams']
  scores: SeasonData['scores']
  selectedTeam: string | null
}

function GameDaySection({ dayNum, games, teams, scores, selectedTeam }: GameDayProps) {
  // Derive unique time slots (sorted) and fields present this day
  const timeSlots = useMemo(() => {
    const times = [...new Set(games.map((g) => g.match_time).filter(Boolean))] as string[]
    return times.sort()
  }, [games])

  const fields = useMemo(() => {
    const present = new Set(games.map((g) => g.field).filter(Boolean) as string[])
    return FIELD_ORDER.filter((f) => present.has(f))
  }, [games])

  // Lookup: time → field → game
  const grid = useMemo(() => {
    const map = new Map<string, Map<string, DbGame>>()
    for (const game of games) {
      if (!game.match_time || !game.field) continue
      if (!map.has(game.match_time)) map.set(game.match_time, new Map())
      map.get(game.match_time)!.set(game.field, game)
    }
    return map
  }, [games])

  // Game day metadata lives on every game row — grab from first game
  const meta = games[0]
  const setupTeams = meta?.field_setup_teams ?? null
  const packdownTeams = meta?.field_packdown_teams ?? null
  const theme = meta?.game_day_theme ?? null
  const themeDesc = meta?.game_day_theme_desc ?? null

  // Date from scheduled_at of first game
  const date = useMemo(() => {
    const iso = games.find((g) => g.scheduled_at)?.scheduled_at
    if (!iso) return null
    return new Date(iso).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }, [games])

  return (
    <section>
      {/* Game day header */}
      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Game Day {dayNum}
          </h2>
          {date && (
            <span className="text-xs font-medium text-slate-400">{date}</span>
          )}
          {theme && (
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-indigo-600">
              {theme}
            </span>
          )}
        </div>
        {themeDesc && (
          <p className="text-xs text-slate-400 italic">{themeDesc}</p>
        )}
        {(setupTeams || packdownTeams) && (
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 space-y-1.5">
            <DutiesRow label="Setup" teamColors={setupTeams} teams={teams} />
            <DutiesRow label="Pack down" teamColors={packdownTeams} teams={teams} />
          </div>
        )}
      </div>

      {/* Timetable grid */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[480px] border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-20 pb-2 pr-3 text-right text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
                Time
              </th>
              {fields.map((field) => (
                <th
                  key={field}
                  className="pb-2 px-1.5 text-center text-[0.65rem] font-bold uppercase tracking-widest text-slate-400"
                >
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => {
              const row = grid.get(time)
              return (
                <tr key={time} className="align-top">
                  <td className="pr-3 pt-1 pb-2 text-right text-[0.7rem] font-semibold tabular-nums text-slate-500 whitespace-nowrap">
                    {time}
                  </td>
                  {fields.map((field) => {
                    const game = row?.get(field)
                    if (!game) {
                      return <td key={field} className="px-1.5 pt-1 pb-2" />
                    }
                    const dimmed =
                      selectedTeam !== null &&
                      game.team_a !== selectedTeam &&
                      game.team_b !== selectedTeam
                    return (
                      <td key={field} className="px-1.5 pt-1 pb-2">
                        <GameCell
                          game={game}
                          teams={teams}
                          scores={scores}
                          dimmed={dimmed}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ScheduleView({ data }: Props) {
  const { games, teams, scores } = data
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // Group by game_day_number
  const gameDays = useMemo(() => {
    const map = new Map<number, DbGame[]>()
    for (const game of games) {
      const day = game.game_day_number ?? 0
      const existing = map.get(day) ?? []
      existing.push(game)
      map.set(day, existing)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [games])

  // Team list for dropdown, sorted by division order then name
  const teamList = useMemo(() => {
    const divOrder: Record<string, number> = { Div1: 0, Div2: 1, Guardian: 2 }
    return Object.values(teams).sort((a, b) => {
      const da = divOrder[a.division ?? ''] ?? 99
      const db = divOrder[b.division ?? ''] ?? 99
      if (da !== db) return da - db
      return (a.display_name ?? '').localeCompare(b.display_name ?? '')
    })
  }, [teams])

  if (gameDays.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        No games scheduled yet.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {/* Team filter dropdown */}
      <div className="flex items-center gap-3">
        <label htmlFor="team-filter" className="shrink-0 text-xs font-semibold text-slate-500">
          Filter by team
        </label>
        <select
          id="team-filter"
          value={selectedTeam ?? ''}
          onChange={(e) => setSelectedTeam(e.target.value || null)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All teams</option>
          {teamList.map((team) => (
            <option key={team.team_color} value={team.team_color}>
              {team.emoji ? `${team.emoji} ` : ''}{team.display_name ?? team.team_color}
            </option>
          ))}
        </select>
      </div>

      {/* Game day sections */}
      {gameDays.map(([dayNum, dayGames]) => (
        <GameDaySection
          key={dayNum}
          dayNum={dayNum}
          games={dayGames}
          teams={teams}
          scores={scores}
          selectedTeam={selectedTeam}
        />
      ))}
    </div>
  )
}
