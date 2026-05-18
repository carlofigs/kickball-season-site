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
  key: string
  label: string
  date: string | null
  dayNumbers: number[]
  games: DbGame[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────


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

function fmtMinutes(total: number): string {
  const clamped = ((total % 1440) + 1440) % 1440
  const h24 = Math.floor(clamped / 60)
  const m = clamped % 60
  const h12 = h24 % 12 || 12
  const period = h24 >= 12 ? 'PM' : 'AM'
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

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

// ─── Duties table ─────────────────────────────────────────────────────────────

type DutiesTableProps = {
  setupTeams: string[]
  packdownTeams: string[]
  lineRefByTime: Array<[string, string[]]>
  setupTime: string | null
  packdownTime: string | null
  teams: SeasonData['teams']
}

function DutiesTable({
  setupTeams, packdownTeams, lineRefByTime,
  setupTime, packdownTime, teams,
}: DutiesTableProps) {
  const hasAny = setupTeams.length > 0 || packdownTeams.length > 0 || lineRefByTime.length > 0
  if (!hasAny) return null

  // Always show dot + team_color key (e.g. "Baby Blue")
  function TeamCell({ colors }: { colors: string[] }) {
    if (!colors.length) return <td className="px-3 py-2 text-xs text-slate-300">—</td>
    return (
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1.5">
          {colors.map(c => {
            const hex = teams[c]?.color_hex ?? '#94a3b8'
            return (
              <span key={c} className="inline-flex items-center gap-1 text-xs text-slate-600">
                <span
                  className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: hex }}
                />
                {c}
              </span>
            )
          })}
        </div>
      </td>
    )
  }

  return (
    <div>
      <p className="mb-1.5 text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
        Team Duties
      </p>
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
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
              <tr className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Wrench className="size-3 text-green-500" /> Setup
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-500 whitespace-nowrap">
                  {setupTime ?? '—'}
                </td>
                <TeamCell colors={setupTeams} />
              </tr>
            )}
            {packdownTeams.length > 0 && (
              <tr className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Package className="size-3 text-amber-500" /> Pack Down
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-500 whitespace-nowrap">
                  {packdownTime ?? '—'}
                </td>
                <TeamCell colors={packdownTeams} />
              </tr>
            )}
            {lineRefByTime.map(([time, colors]) => (
              <tr key={time} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Flag className="size-3 text-slate-400" /> Line Ref
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-500 whitespace-nowrap">{time}</td>
                <TeamCell colors={colors} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Timetable game cell (All Teams) ─────────────────────────────────────────

function TimetableCell({
  game, teams, scores,
}: {
  game: DbGame
  teams: SeasonData['teams']
  scores: SeasonData['scores']
}) {
  const score = scores[game.uuid]
  const hasScore = score && score.score_a != null && score.score_b != null
  const aWon = hasScore && score.score_a! > score.score_b!
  const bWon = hasScore && score.score_b! > score.score_a!
  const tA = game.team_a ? teams[game.team_a] : null
  const tB = game.team_b ? teams[game.team_b] : null

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs h-full">
      {/* Team A */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="size-2 shrink-0 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: tA?.color_hex ?? '#94a3b8' }}
        />
        <span className={`truncate leading-tight ${aWon ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
          {game.team_a ?? '—'}
        </span>
        {hasScore && (
          <span className={`ml-auto shrink-0 tabular-nums ${aWon ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
            {score.score_a}
          </span>
        )}
      </div>
      <div className="my-1 border-t border-slate-100" />
      {/* Team B */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="size-2 shrink-0 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: tB?.color_hex ?? '#94a3b8' }}
        />
        <span className={`truncate leading-tight ${bWon ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
          {game.team_b ?? '—'}
        </span>
        {hasScore && (
          <span className={`ml-auto shrink-0 tabular-nums ${bWon ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
            {score.score_b}
          </span>
        )}
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
  const setupTeams = useMemo(() => {
    const seen = new Set<string>()
    for (const g of group.games) for (const c of g.field_setup_teams ?? []) seen.add(c)
    return [...seen]
  }, [group.games])

  const packdownTeams = useMemo(() => {
    const seen = new Set<string>()
    for (const g of group.games) for (const c of g.field_packdown_teams ?? []) seen.add(c)
    return [...seen]
  }, [group.games])

  const lineRefByTime = useMemo((): Array<[string, string[]]> => {
    const map = new Map<string, string[]>()
    for (const g of group.games) {
      if (!g.line_ref_teams?.length || !g.match_time) continue
      const prev = map.get(g.match_time) ?? []
      map.set(g.match_time, [...new Set([...prev, ...g.line_ref_teams])])
    }
    return [...map.entries()].sort(([a], [b]) => parseMatchTime(a) - parseMatchTime(b))
  }, [group.games])

  const { setup: setupTime, packdown: packdownTime } = useMemo(
    () => dutyTimes(group.games), [group.games],
  )

  // Time rows × field columns
  const timeSlots = useMemo(() => {
    const times = [...new Set(group.games.map(g => g.match_time).filter(Boolean))] as string[]
    return times.sort((a, b) => parseMatchTime(a) - parseMatchTime(b))
  }, [group.games])

  const fieldsPresent = useMemo(() => {
    const present = new Set(group.games.map(g => g.field).filter(Boolean) as string[])
    return FIELD_ORDER.filter(f => present.has(f))
  }, [group.games])

  // Lookup: time → field → game
  const grid = useMemo(() => {
    const map = new Map<string, Map<string, DbGame>>()
    for (const g of group.games) {
      if (!g.match_time || !g.field) continue
      if (!map.has(g.match_time)) map.set(g.match_time, new Map())
      map.get(g.match_time)!.set(g.field, g)
    }
    return map
  }, [group.games])

  const meta = group.games[0]
  const theme = meta?.game_day_theme ?? null
  const themeDesc = meta?.game_day_theme_desc ?? null

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
          {themeDesc && (
            <p className="text-xs text-slate-400 italic">{themeDesc}</p>
          )}

          {/* Timetable: time rows × field columns */}
          <div>
          <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
            Timetable
          </p>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="border-collapse text-xs" style={{ minWidth: 'max-content', width: '100%' }}>
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="sticky left-0 z-10 bg-white pb-2 pl-4 pr-3 text-right text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 w-[4.5rem]">
                    <span className="flex items-center justify-end gap-1">
                      <Clock className="size-3" /> Time
                    </span>
                  </th>
                  {fieldsPresent.map(f => (
                    <th key={f} className="pb-2 px-1.5 pr-4 sm:pr-1.5 text-center text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 min-w-[9rem]">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time} className="align-top">
                    <td className="sticky left-0 z-10 bg-white pl-4 pr-3 pt-1.5 pb-2 text-right tabular-nums font-semibold text-slate-500 whitespace-nowrap">
                      {time}
                    </td>
                    {fieldsPresent.map((field, i) => {
                      const game = grid.get(time)?.get(field)
                      const isLast = i === fieldsPresent.length - 1
                      return (
                        <td key={field} className={`px-1.5 pt-1.5 pb-2 ${isLast ? 'pr-4 sm:pr-1.5' : ''}`}>
                          {game
                            ? <TimetableCell game={game} teams={teams} scores={scores} />
                            : null
                          }
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>

          <DutiesTable
            setupTeams={setupTeams}
            packdownTeams={packdownTeams}
            lineRefByTime={lineRefByTime}
            setupTime={setupTime}
            packdownTime={packdownTime}
            teams={teams}
          />
        </div>
      )}
    </div>
  )
}

// ─── Team game card (Selected Team view) ─────────────────────────────────────

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

  return (
    <div
      className="rounded-xl border bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      style={{ borderColor: `${oppHex}40` }}
    >
      <div className="h-1" style={{ backgroundColor: oppHex }} />
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            Game Day {game.game_day_number}
          </span>
          {game.scheduled_at && (
            <span className="text-xs text-slate-400">
              {fmtDate(game.scheduled_at.substring(0, 10))}
            </span>
          )}
          {opponentColor && (
            <span
              className="ml-auto rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold truncate max-w-[180px]"
              style={{ backgroundColor: `${oppHex}22`, color: oppHex }}
            >
              {opponent?.display_name
                ? `${opponentColor} · ${opponent.display_name}`
                : opponentColor}
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
              {!iWon && !theyWon && <span className="ml-1 text-[0.6rem] font-semibold text-slate-400">D</span>}
            </span>
          )}
        </div>

        {/* Duty badges */}
        {(isOnSetup || isOnPackdown || isOnLineRef) && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
            {isOnSetup && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 border border-green-100 px-2 py-0.5 text-[0.65rem] font-semibold text-green-700">
                <Wrench className="size-2.5" /> Field Setup{setupTime ? ` · ${setupTime}` : ''}
              </span>
            )}
            {isOnPackdown && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                <Package className="size-2.5" /> Pack Down{packdownTime ? ` · ${packdownTime}` : ''}
              </span>
            )}
            {isOnLineRef && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600">
                <Flag className="size-2.5" /> Line Ref
                {game.match_time ? ` · ${game.match_time}` : ''}
                {game.field ? ` · ${game.field}` : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Team view ────────────────────────────────────────────────────────────────

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

  const setupDays = gameDays.filter(([, gs]) => gs.some(g => g.field_setup_teams?.includes(teamColor))).map(([n]) => n)
  const packdownDays = gameDays.filter(([, gs]) => gs.some(g => g.field_packdown_teams?.includes(teamColor))).map(([n]) => n)
  const lineRefDays = gameDays.filter(([, gs]) => gs.some(g => g.line_ref_teams?.includes(teamColor))).map(([n]) => n)

  const myGames = useMemo(() =>
    gameDays.flatMap(([, gs]) => gs.filter(g => g.team_a === teamColor || g.team_b === teamColor)),
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

// ─── Main view ────────────────────────────────────────────────────────────────

export function ScheduleView({ data }: Props) {
  const { games, teams, scores } = data
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [openDays, setOpenDays] = useState<Set<string>>(new Set())

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

  const calendarGroups = useMemo((): CalendarGroup[] => {
    const groups: CalendarGroup[] = []
    for (const [dayNum, dayGames] of gameDays) {
      const date = dayGames[0]?.scheduled_at?.substring(0, 10) ?? null
      const last = groups[groups.length - 1]
      if (last && date && last.date === date) {
        last.label += ` & ${dayNum}`
        last.key += `-${dayNum}`
        last.dayNumbers.push(dayNum)
        last.games.push(...dayGames)
      } else {
        groups.push({ key: String(dayNum), label: `Game ${dayNum}`, date, dayNumbers: [dayNum], games: [...dayGames] })
      }
    }
    return groups
  }, [gameDays])

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
    return <p className="py-12 text-center text-sm text-slate-400">No games scheduled yet.</p>
  }

  return (
    <div className="space-y-6">
      {/* Team filter */}
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
        <TeamView teamColor={selectedTeam} gameDays={gameDays} teams={teams} scores={scores} />
      )}
    </div>
  )
}
