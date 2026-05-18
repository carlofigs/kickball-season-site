import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Wrench, Package, Flag, Clock, MapPin } from 'lucide-react'
import type { SeasonData, DbGame } from '../../../types/schedule'

type Props = {
  data: SeasonData
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD_ORDER = ['Road', 'Middle', 'Kiosk', 'Water']

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarGroup {
  key: string          // "3" or "3-4"
  label: string        // "Game 3" or "Game 3 & 4"
  date: string | null  // "YYYY-MM-DD"
  dayNumbers: number[]
  games: DbGame[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns #1e293b or #ffffff depending on background luminance. */
function contrastColor(hex: string | null): string {
  if (!hex || hex.length < 7) return '#ffffff'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1e293b' : '#ffffff'
}

/** Parse "H:MM AM/PM" → minutes since midnight, NaN on failure. */
function parseMatchTime(t: string): number {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return NaN
  let h = parseInt(m[1])
  const min = parseInt(m[2])
  const pm = m[3].toUpperCase() === 'PM'
  if (pm && h !== 12) h += 12
  if (!pm && h === 12) h = 0
  return h * 60 + min
}

/** Format minutes-since-midnight → "H:MM AM/PM". */
function fmtMinutes(total: number): string {
  const clamped = ((total % 1440) + 1440) % 1440
  const h24 = Math.floor(clamped / 60)
  const m = clamped % 60
  const h12 = h24 % 12 || 12
  const period = h24 >= 12 ? 'PM' : 'AM'
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** Format "YYYY-MM-DD" → "15 Mar 2026". */
function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/** Derive setup/packdown times from the earliest/latest game in a group. */
function dutyTimes(games: DbGame[]): { setup: string | null; packdown: string | null } {
  const mins = games
    .map(g => g.match_time ? parseMatchTime(g.match_time) : NaN)
    .filter(n => !isNaN(n))
  if (!mins.length) return { setup: null, packdown: null }
  return {
    setup: fmtMinutes(Math.min(...mins) - 60),
    packdown: fmtMinutes(Math.max(...mins) + 60),
  }
}

// ─── Team duty chip ───────────────────────────────────────────────────────────

function DutyChip({ teamColor, teams }: { teamColor: string; teams: SeasonData['teams'] }) {
  const team = teams[teamColor]
  const bg = team?.color_hex ?? '#94a3b8'
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.6rem] font-bold"
      style={{ backgroundColor: bg, color: contrastColor(bg) }}
    >
      {team?.team_color ?? teamColor}
    </span>
  )
}

// ─── Duty row ─────────────────────────────────────────────────────────────────

type DutyRowProps = {
  Icon: React.ComponentType<{ className?: string }>
  iconClass: string
  label: string
  time: string | null
  teamColors: string[]
  teams: SeasonData['teams']
}

function DutyRow({ Icon, iconClass, label, time, teamColors, teams }: DutyRowProps) {
  if (!teamColors.length) return null
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <Icon className={`shrink-0 size-3.5 ${iconClass}`} />
      <span className="shrink-0 font-semibold text-slate-600">{label}</span>
      {time && <span className="shrink-0 text-slate-400">{time}</span>}
      <div className="flex flex-wrap gap-1">
        {teamColors.map(c => <DutyChip key={c} teamColor={c} teams={teams} />)}
      </div>
    </div>
  )
}

// ─── Gradient matchup bar ─────────────────────────────────────────────────────

function MatchupBar({
  game, teams, scores,
}: {
  game: DbGame
  teams: SeasonData['teams']
  scores: SeasonData['scores']
}) {
  const tA = game.team_a ? teams[game.team_a] : null
  const tB = game.team_b ? teams[game.team_b] : null
  const score = scores[game.uuid]
  const hasScore = score && score.score_a != null && score.score_b != null
  const aWon = hasScore && score.score_a! > score.score_b!
  const bWon = hasScore && score.score_b! > score.score_a!
  const cA = tA?.color_hex ?? '#94a3b8'
  const cB = tB?.color_hex ?? '#64748b'

  return (
    <div className="flex h-9 w-full overflow-hidden rounded-lg text-xs font-semibold">
      {/* Team A */}
      <div
        className="flex flex-1 items-center truncate px-3"
        style={{ backgroundColor: cA, color: contrastColor(cA) }}
      >
        <span className={`truncate ${aWon ? 'font-extrabold' : ''}`}>
          {tA?.display_name ?? game.team_a ?? '—'}
        </span>
      </div>
      {/* Score / VS */}
      <div
        className="flex shrink-0 items-center px-2 font-bold text-white text-[0.65rem]"
        style={{ backgroundColor: 'rgba(0,0,0,0.28)' }}
      >
        {hasScore ? `${score.score_a} – ${score.score_b}` : 'vs'}
      </div>
      {/* Team B */}
      <div
        className="flex flex-1 items-center justify-end truncate px-3"
        style={{ backgroundColor: cB, color: contrastColor(cB) }}
      >
        <span className={`truncate text-right ${bWon ? 'font-extrabold' : ''}`}>
          {tB?.display_name ?? game.team_b ?? '—'}
        </span>
      </div>
    </div>
  )
}

// ─── Game day accordion (All Teams) ───────────────────────────────────────────

function GameDayAccordion({
  group, teams, scores, isOpen, onToggle,
}: {
  group: CalendarGroup
  teams: SeasonData['teams']
  scores: SeasonData['scores']
  isOpen: boolean
  onToggle: () => void
}) {
  // Derive duties
  const setupTeams = useMemo(() => {
    const seen = new Set<string>()
    for (const g of group.games) {
      for (const c of g.field_setup_teams ?? []) seen.add(c)
    }
    return [...seen]
  }, [group.games])

  const packdownTeams = useMemo(() => {
    const seen = new Set<string>()
    for (const g of group.games) {
      for (const c of g.field_packdown_teams ?? []) seen.add(c)
    }
    return [...seen]
  }, [group.games])

  const lineRefByTime = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const g of group.games) {
      if (!g.line_ref_teams?.length || !g.match_time) continue
      const prev = map.get(g.match_time) ?? []
      map.set(g.match_time, [...new Set([...prev, ...g.line_ref_teams])])
    }
    return [...map.entries()].sort(([a], [b]) => parseMatchTime(a) - parseMatchTime(b))
  }, [group.games])

  const { setup: setupTime, packdown: packdownTime } = useMemo(
    () => dutyTimes(group.games),
    [group.games],
  )

  // Time-grouped matchups
  const timeslots = useMemo(() => {
    const map = new Map<string, Map<string, DbGame>>()
    for (const g of group.games) {
      if (!g.match_time || !g.field) continue
      if (!map.has(g.match_time)) map.set(g.match_time, new Map())
      map.get(g.match_time)!.set(g.field, g)
    }
    return [...map.entries()].sort(([a], [b]) => parseMatchTime(a) - parseMatchTime(b))
  }, [group.games])

  const fieldsPresent = useMemo(() => {
    const present = new Set(group.games.map(g => g.field).filter(Boolean) as string[])
    return FIELD_ORDER.filter(f => present.has(f))
  }, [group.games])

  const meta = group.games[0]
  const theme = meta?.game_day_theme ?? null
  const themeDesc = meta?.game_day_theme_desc ?? null
  const hasDuties = setupTeams.length > 0 || packdownTeams.length > 0 || lineRefByTime.length > 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-sm font-bold text-slate-800">{group.label}</span>
            {group.date && (
              <span className="text-xs text-slate-400">{fmtDate(group.date)}</span>
            )}
            {theme && (
              <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[0.6rem] font-semibold text-indigo-600 truncate">
                {theme}
              </span>
            )}
          </div>
        </div>
        {isOpen
          ? <ChevronUp className="shrink-0 size-4 text-slate-400" />
          : <ChevronDown className="shrink-0 size-4 text-slate-400" />
        }
      </button>

      {/* Body */}
      {isOpen && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
          {/* Theme description */}
          {themeDesc && (
            <p className="text-xs text-slate-400 italic">{themeDesc}</p>
          )}

          {/* Team duties */}
          {hasDuties && (
            <div className="space-y-2">
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
                Team Duties
              </p>
              <DutyRow
                Icon={Wrench}
                iconClass="text-green-500"
                label="Field Setup"
                time={setupTime}
                teamColors={setupTeams}
                teams={teams}
              />
              <DutyRow
                Icon={Package}
                iconClass="text-amber-500"
                label="Pack Down"
                time={packdownTime}
                teamColors={packdownTeams}
                teams={teams}
              />
              {lineRefByTime.map(([time, colors]) => (
                <DutyRow
                  key={time}
                  Icon={Flag}
                  iconClass="text-slate-400"
                  label="Line Ref"
                  time={time}
                  teamColors={colors}
                  teams={teams}
                />
              ))}
            </div>
          )}

          {/* Timetable */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 space-y-4">
            {timeslots.map(([time, fieldMap]) => (
              <div key={time}>
                {/* Time header */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="size-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500">{time}</span>
                </div>
                {/* Field rows */}
                <div className="space-y-1.5">
                  {fieldsPresent.map(field => {
                    const game = fieldMap.get(field)
                    if (!game) return null
                    return (
                      <div key={field} className="flex items-center gap-2 min-w-[380px] sm:min-w-0">
                        <div className="flex items-center gap-1 w-20 shrink-0">
                          <MapPin className="size-3 text-slate-300" />
                          <span className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-wide">
                            {field}
                          </span>
                        </div>
                        <div className="flex-1">
                          <MatchupBar game={game} teams={teams} scores={scores} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Team view — YOUR TEAM summary + game cards ───────────────────────────────

function TeamGameCard({
  game, teamColor, teams, scores,
}: {
  game: DbGame
  teamColor: string
  teams: SeasonData['teams']
  scores: SeasonData['scores']
}) {
  const isTeamA = game.team_a === teamColor
  const opponentColor = isTeamA ? game.team_b : game.team_a
  const opponent = opponentColor ? teams[opponentColor] : null
  const oppHex = opponent?.color_hex ?? '#94a3b8'
  const score = scores[game.uuid]
  const hasScore = score && score.score_a != null && score.score_b != null

  const myScore = hasScore ? (isTeamA ? score.score_a : score.score_b) : null
  const theirScore = hasScore ? (isTeamA ? score.score_b : score.score_a) : null
  const iWon = myScore !== null && theirScore !== null && myScore > theirScore!
  const theyWon = myScore !== null && theirScore !== null && theirScore! > myScore

  const isOnSetup = game.field_setup_teams?.includes(teamColor) ?? false
  const isOnPackdown = game.field_packdown_teams?.includes(teamColor) ?? false
  const isOnLineRef = game.line_ref_teams?.includes(teamColor) ?? false

  const { setup: setupTime, packdown: packdownTime } = dutyTimes([game])

  const gameDate = game.scheduled_at?.substring(0, 10) ?? null

  return (
    <div
      className="rounded-xl border bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      style={{ borderColor: `${oppHex}40` }}
    >
      {/* Color accent bar */}
      <div className="h-1" style={{ backgroundColor: oppHex }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            Game Day {game.game_day_number}
          </span>
          {gameDate && (
            <span className="text-xs text-slate-400">{fmtDate(gameDate)}</span>
          )}
          {opponent && (
            <span
              className="ml-auto rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold truncate max-w-[140px]"
              style={{ backgroundColor: `${oppHex}22`, color: oppHex }}
            >
              {opponent.display_name ?? opponentColor}
            </span>
          )}
        </div>

        {/* Theme */}
        {game.game_day_theme && (
          <div>
            <p className="text-xs font-semibold text-slate-600">{game.game_day_theme}</p>
            {game.game_day_theme_desc && (
              <p className="text-[0.7rem] text-slate-400 italic mt-0.5">{game.game_day_theme_desc}</p>
            )}
          </div>
        )}

        {/* Time + field + score */}
        <div className="flex flex-wrap items-center gap-3">
          {game.match_time && (
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Clock className="size-3 text-slate-400" />
              {game.match_time}
            </span>
          )}
          {game.field && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
              <MapPin className="size-2.5" />
              {game.field}
            </span>
          )}
          {hasScore && (
            <span className={`ml-auto text-sm font-bold tabular-nums ${iWon ? 'text-green-600' : theyWon ? 'text-slate-400' : 'text-slate-600'}`}>
              {myScore} – {theirScore}
              {iWon && <span className="ml-1 text-[0.6rem] font-semibold text-green-500">W</span>}
              {theyWon && <span className="ml-1 text-[0.6rem] font-semibold text-red-400">L</span>}
              {!iWon && !theyWon && hasScore && <span className="ml-1 text-[0.6rem] font-semibold text-slate-400">D</span>}
            </span>
          )}
        </div>

        {/* Duty badges */}
        {(isOnSetup || isOnPackdown || isOnLineRef) && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
            {isOnSetup && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 border border-green-100 px-2 py-0.5 text-[0.65rem] font-semibold text-green-700">
                <Wrench className="size-2.5" /> Field Setup {setupTime ? `· ${setupTime}` : ''}
              </span>
            )}
            {isOnPackdown && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                <Package className="size-2.5" /> Pack Down {packdownTime ? `· ${packdownTime}` : ''}
              </span>
            )}
            {isOnLineRef && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600">
                <Flag className="size-2.5" /> Line Ref · {game.match_time}
                {game.field ? ` · ${game.field}` : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TeamView({
  teamColor, gameDays, teams, scores,
}: {
  teamColor: string
  gameDays: Array<[number, DbGame[]]>
  teams: SeasonData['teams']
  scores: SeasonData['scores']
}) {
  const team = teams[teamColor]
  const hex = team?.color_hex ?? '#94a3b8'

  // Duty summary: which game days
  const setupDays = gameDays
    .filter(([, games]) => games.some(g => g.field_setup_teams?.includes(teamColor)))
    .map(([n]) => n)
  const packdownDays = gameDays
    .filter(([, games]) => games.some(g => g.field_packdown_teams?.includes(teamColor)))
    .map(([n]) => n)
  const lineRefDays = gameDays
    .filter(([, games]) => games.some(g => g.line_ref_teams?.includes(teamColor)))
    .map(([n]) => n)

  // My games
  const myGames = useMemo(() =>
    gameDays.flatMap(([, games]) =>
      games.filter(g => g.team_a === teamColor || g.team_b === teamColor)
    ),
    [gameDays, teamColor],
  )

  function DayChip({ n }: { n: number }) {
    return (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600">
        Game {n}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* YOUR TEAM card */}
      <div
        className="rounded-xl border overflow-hidden bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
        style={{ borderColor: `${hex}40` }}
      >
        {/* Color bar */}
        <div className="h-1.5" style={{ backgroundColor: hex }} />
        <div className="p-4 space-y-3">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">Your Team</p>
          <p className="text-base font-extrabold text-slate-800">
            {team?.emoji && <span className="mr-1.5">{team.emoji}</span>}
            {team?.display_name ?? teamColor}
          </p>

          {/* Duties summary */}
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
          <TeamGameCard
            key={game.uuid}
            game={game}
            teamColor={teamColor}
            teams={teams}
            scores={scores}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ScheduleView({ data }: Props) {
  const { games, teams, scores } = data
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [openDays, setOpenDays] = useState<Set<string>>(new Set())

  // Individual game days sorted
  const gameDays = useMemo((): Array<[number, DbGame[]]> => {
    const map = new Map<number, DbGame[]>()
    for (const g of games) {
      const d = g.game_day_number ?? 0
      const arr = map.get(d) ?? []
      arr.push(g)
      map.set(d, arr)
    }
    return [...map.entries()].sort(([a], [b]) => a - b)
  }, [games])

  // Calendar groups — consecutive game days sharing the same date are merged
  const calendarGroups = useMemo((): CalendarGroup[] => {
    const groups: CalendarGroup[] = []
    for (const [dayNum, dayGames] of gameDays) {
      const date = dayGames[0]?.scheduled_at?.substring(0, 10) ?? null
      const last = groups[groups.length - 1]
      if (last && date && last.date === date) {
        last.label = last.label.replace('Game ', 'Game ') + ` & ${dayNum}`
        last.key += `-${dayNum}`
        last.dayNumbers.push(dayNum)
        last.games.push(...dayGames)
      } else {
        groups.push({
          key: String(dayNum),
          label: `Game ${dayNum}`,
          date,
          dayNumbers: [dayNum],
          games: [...dayGames],
        })
      }
    }
    return groups
  }, [gameDays])

  // Sorted team list for dropdown
  const teamList = useMemo(() => {
    const divOrder: Record<string, number> = { Div1: 0, Div2: 1, Guardian: 2 }
    return Object.values(teams).sort((a, b) => {
      const da = divOrder[a.division ?? ''] ?? 99
      const db = divOrder[b.division ?? ''] ?? 99
      return da !== db ? da - db : (a.display_name ?? '').localeCompare(b.display_name ?? '')
    })
  }, [teams])

  const toggleDay = (key: string) => {
    setOpenDays(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  if (gameDays.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">No games scheduled yet.</p>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team filter dropdown */}
      <div className="flex items-center gap-3">
        <label htmlFor="team-filter" className="shrink-0 text-xs font-semibold text-slate-500">
          Filter by team
        </label>
        <select
          id="team-filter"
          value={selectedTeam ?? ''}
          onChange={e => setSelectedTeam(e.target.value || null)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Teams</option>
          {teamList.map(t => (
            <option key={t.team_color} value={t.team_color}>
              {t.emoji ? `${t.emoji} ` : ''}{t.display_name ?? t.team_color}
            </option>
          ))}
        </select>
      </div>

      {/* Views */}
      {selectedTeam === null ? (
        <div className="space-y-3">
          {calendarGroups.map(group => (
            <GameDayAccordion
              key={group.key}
              group={group}
              teams={teams}
              scores={scores}
              isOpen={openDays.has(group.key)}
              onToggle={() => toggleDay(group.key)}
            />
          ))}
        </div>
      ) : (
        <TeamView
          teamColor={selectedTeam}
          gameDays={gameDays}
          teams={teams}
          scores={scores}
        />
      )}
    </div>
  )
}
