import { useState, useMemo } from 'react'
import type { SeasonData, DbGame } from '../../../types/schedule'

type Props = {
  data: SeasonData
}

// ─── Team filter chip ─────────────────────────────────────────────────────────

type ChipProps = {
  label: string
  emoji?: string | null
  colorHex?: string | null
  active: boolean
  onClick: () => void
}

function TeamChip({ label, emoji, colorHex, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
        active
          ? 'border-transparent text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800',
      ].join(' ')}
      style={active && colorHex ? { backgroundColor: colorHex } : undefined}
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {label}
    </button>
  )
}

// ─── Game card ────────────────────────────────────────────────────────────────

type GameCardProps = {
  game: DbGame
  teams: SeasonData['teams']
  scores: SeasonData['scores']
  highlightTeam: string | null
}

function GameCard({ game, teams, scores, highlightTeam }: GameCardProps) {
  const score = scores[game.uuid]
  const hasScore = score && score.score_a != null && score.score_b != null
  const isComplete = game.status === 'complete' || hasScore

  const teamA = game.team_a ? teams[game.team_a] : null
  const teamB = game.team_b ? teams[game.team_b] : null

  const aWon = hasScore && score.score_a! > score.score_b!
  const bWon = hasScore && score.score_b! > score.score_a!

  const isDimmed =
    highlightTeam !== null &&
    game.team_a !== highlightTeam &&
    game.team_b !== highlightTeam

  return (
    <div
      className={[
        'rounded-xl border bg-white transition-opacity',
        isDimmed ? 'opacity-25' : 'opacity-100',
        isComplete
          ? 'border-slate-900/[0.07] shadow-[0_1px_3px_rgba(15,23,42,0.06)]'
          : 'border-slate-200',
      ].join(' ')}
    >
      {/* Meta row */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2">
        {game.match_time && (
          <span className="text-[0.7rem] font-semibold tabular-nums text-slate-500">
            {game.match_time}
          </span>
        )}
        {game.field && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
            {game.field}
          </span>
        )}
        {!isComplete && (
          <span className="ml-auto rounded-full border border-slate-200 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-400">
            Upcoming
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Team A */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {teamA && (
            <span
              className="shrink-0 size-2.5 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: teamA.color_hex ?? '#94a3b8' }}
              aria-hidden="true"
            />
          )}
          <span
            className={[
              'truncate text-sm',
              aWon ? 'font-bold text-slate-900' : 'font-medium text-slate-700',
            ].join(' ')}
          >
            {teamA?.emoji && (
              <span className="mr-1" aria-hidden="true">
                {teamA.emoji}
              </span>
            )}
            {teamA?.display_name ?? game.team_a ?? '—'}
          </span>
        </div>

        {/* Score or VS */}
        <div className="shrink-0 px-2 text-center">
          {hasScore ? (
            <span className="text-sm font-bold tabular-nums text-slate-900">
              {score.score_a} – {score.score_b}
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-300">vs</span>
          )}
        </div>

        {/* Team B */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span
            className={[
              'truncate text-right text-sm',
              bWon ? 'font-bold text-slate-900' : 'font-medium text-slate-700',
            ].join(' ')}
          >
            {teamB?.display_name ?? game.team_b ?? '—'}
            {teamB?.emoji && (
              <span className="ml-1" aria-hidden="true">
                {teamB.emoji}
              </span>
            )}
          </span>
          {teamB && (
            <span
              className="shrink-0 size-2.5 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: teamB.color_hex ?? '#94a3b8' }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ScheduleView({ data }: Props) {
  const { games, teams, scores } = data
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // Group season games by game_day_number, sorted
  const gameDays = useMemo(() => {
    const map = new Map<number, DbGame[]>()
    for (const game of games) {
      const day = game.game_day_number ?? 0
      const existing = map.get(day) ?? []
      existing.push(game)
      map.set(day, existing)
    }
    for (const [, dayGames] of map) {
      dayGames.sort((a, b) => (a.match_time ?? '').localeCompare(b.match_time ?? ''))
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [games])

  // Sorted team list for chip bar: division order then display name
  const teamList = useMemo(() => {
    const divOrder: Record<string, number> = { Div1: 0, Div2: 1, Guardian: 2 }
    return Object.values(teams).sort((a, b) => {
      const da = divOrder[a.division ?? ''] ?? 99
      const db = divOrder[b.division ?? ''] ?? 99
      if (da !== db) return da - db
      return (a.display_name ?? '').localeCompare(b.display_name ?? '')
    })
  }, [teams])

  const toggleTeam = (color: string) => {
    setSelectedTeam((prev) => (prev === color ? null : color))
  }

  if (gameDays.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        No games scheduled yet.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team filter chip bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {selectedTeam !== null && (
          <button
            onClick={() => setSelectedTeam(null)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
          >
            ✕ All
          </button>
        )}
        {teamList.map((team) => (
          <TeamChip
            key={team.team_color}
            label={team.display_name ?? team.team_color}
            emoji={team.emoji}
            colorHex={team.color_hex}
            active={selectedTeam === team.team_color}
            onClick={() => toggleTeam(team.team_color)}
          />
        ))}
      </div>

      {/* Game day sections */}
      {gameDays.map(([dayNum, dayGames]) => (
        <section key={dayNum}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
            Game Day {dayNum}
          </h2>
          <div className="space-y-2">
            {dayGames.map((game) => (
              <GameCard
                key={game.uuid}
                game={game}
                teams={teams}
                scores={scores}
                highlightTeam={selectedTeam}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
