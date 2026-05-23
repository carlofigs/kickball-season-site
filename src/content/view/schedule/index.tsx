import { useState, useMemo } from 'react'
import type { SeasonData, DbGame } from '../../../types/schedule'
import { teamKey, type CalendarGroup, fmtDate } from './_helpers'
import { GameDayAccordion } from './GameDayAccordion'
import { TeamView } from './TeamView'

type Props = {
  data: SeasonData
}

export function ScheduleView({ data }: Props) {
  const { games, teams, scores, events } = data
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
    // Events-first: season_events drives the grouping; games attach via event_id.
    // Falls back to game_day_number grouping if no season_events are loaded.
    if (events.length > 0) {
      // Build a map of event_uuid → games for O(1) lookup
      const gamesByEventId = new Map<string, DbGame[]>()
      for (const g of games) {
        if (!g.event_id) continue
        const arr = gamesByEventId.get(g.event_id) ?? []
        arr.push(g)
        gamesByEventId.set(g.event_id, arr)
      }

      // Group season_events by week_label (preserving sort_order of first occurrence)
      const groupMap = new Map<string, CalendarGroup>()
      for (const ev of events) {
        if (!groupMap.has(ev.week_label)) {
          groupMap.set(ev.week_label, {
            key: ev.week_label,
            weekLabel: ev.week_label,
            date: ev.event_date,
            sortOrder: ev.sort_order,
            eventLabels: [],
            games: [],
          })
        }
        const group = groupMap.get(ev.week_label)!
        if (ev.division) {
          group.eventLabels.push({ eventName: ev.event_name, division: ev.division })
        }
        const matched = gamesByEventId.get(ev.event_uuid) ?? []
        group.games.push(...matched)
      }

      return [...groupMap.values()].sort((a, b) => a.sortOrder - b.sortOrder)
    }

    // Fallback: group by game_day_number, merge same-date days
    const groups: CalendarGroup[] = []
    for (const [dayNum, dayGames] of gameDays) {
      const date = dayGames[0]?.scheduled_at?.substring(0, 10) ?? null
      const last = groups[groups.length - 1]
      if (last && date && last.date === date) {
        last.key += `-${dayNum}`
        last.games.push(...dayGames)
      } else {
        groups.push({
          key: String(dayNum),
          weekLabel: `Game ${dayNum}`,
          date,
          sortOrder: dayNum,
          eventLabels: [],
          games: [...dayGames],
        })
      }
    }
    return groups
  }, [events, games, gameDays])

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
              {teamList.map(t => {
                const ck = teamKey(t.team_color, t.division)
                return (
                  <option key={ck} value={ck}>
                    {t.emoji ? `${t.emoji} ` : ''}{t.display_name ?? t.team_color}
                  </option>
                )
              })}
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
                <option value="">Week…</option>
                {calendarGroups.filter(g => g.games.length > 0).map(group => (
                  <option key={group.key} value={group.key}>
                    {group.weekLabel}{group.date ? ` · ${fmtDate(group.date)}` : ''}
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
          <TeamView
            teamColor={selectedTeam.split('|')[0]}
            division={selectedTeam.split('|')[1] ?? ''}
            gameDays={gameDays}
            teams={teams}
            scores={scores}
          />
        )}
      </div>
    </div>
  )
}
