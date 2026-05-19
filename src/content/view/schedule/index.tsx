import { useState, useMemo } from 'react'
import type { SeasonData, DbGame } from '../../../types/schedule'
import { type CalendarGroup, fmtDate } from './_helpers'
import { GameDayAccordion } from './GameDayAccordion'
import { TeamView } from './TeamView'

type Props = {
  data: SeasonData
}

export function ScheduleView({ data }: Props) {
  const { games, teams, scores } = data
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [openDays, setOpenDays] = useState<Set<string>>(new Set())
  const [jumpDay, setJumpDay] = useState('')

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

  function jumpToDay(key: string) {
    if (!key) return
    setJumpDay('')
    setOpenDays(prev => new Set([...prev, key]))
    setTimeout(() => {
      document.getElementById(`game-day-${key}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  if (gameDays.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-400">No games scheduled yet.</p>
  }

  const selectClass = "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"

  return (
    <div>
      {/* Sticky controls bar */}
      <div className="sticky top-[92px] z-[9] -mx-4 border-b border-slate-100 bg-slate-50/95 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Team filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="team-filter" className="shrink-0 text-xs font-semibold text-slate-500">
              Team
            </label>
            <select
              id="team-filter"
              value={selectedTeam ?? ''}
              onChange={e => setSelectedTeam(e.target.value || null)}
              className={selectClass}
            >
              <option value="">All Teams</option>
              {teamList.map(t => (
                <option key={t.team_color} value={t.team_color}>
                  {t.emoji ? `${t.emoji} ` : ''}{t.display_name ?? t.team_color}
                </option>
              ))}
            </select>
          </div>

          {/* Jump to game day — only in All Teams view */}
          {selectedTeam === null && (
            <div className="flex items-center gap-2">
              <label htmlFor="day-jump" className="shrink-0 text-xs font-semibold text-slate-500">
                Jump to
              </label>
              <select
                id="day-jump"
                value={jumpDay}
                onChange={e => jumpToDay(e.target.value)}
                className={selectClass}
              >
                <option value="">Game day…</option>
                {calendarGroups.map(group => (
                  <option key={group.key} value={group.key}>
                    {group.label}{group.date ? ` · ${fmtDate(group.date)}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {selectedTeam === null ? (
          <div className="space-y-3">
            {calendarGroups.map(group => (
              <div key={group.key} id={`game-day-${group.key}`} style={{ scrollMarginTop: '140px' }}>
                <GameDayAccordion
                  group={group}
                  teams={teams}
                  scores={scores}
                  isOpen={openDays.has(group.key)}
                  onToggle={() => toggleDay(group.key)}
                />
              </div>
            ))}
          </div>
        ) : (
          <TeamView teamColor={selectedTeam} gameDays={gameDays} teams={teams} scores={scores} />
        )}
      </div>
    </div>
  )
}
