import { useMemo } from 'react'
import { ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react'
import type { SeasonData } from '../../../types/schedule'
import { FIELD_ORDER, type CalendarGroup, parseMatchTime, fmtDate, dutyTimes } from './_helpers'
import { DutiesTable } from './DutiesTable'
import { TimetableCell } from './TimetableCell'

type Props = {
  group: CalendarGroup
  teams: SeasonData['teams']
  scores: SeasonData['scores']
  isOpen: boolean
  onToggle: () => void
}

export function GameDayAccordion({ group, teams, scores, isOpen, onToggle }: Props) {
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

  const timeSlots = useMemo(() => {
    const times = [...new Set(group.games.map(g => g.match_time).filter(Boolean))] as string[]
    return times.sort((a, b) => parseMatchTime(a) - parseMatchTime(b))
  }, [group.games])

  const fieldsPresent = useMemo(() => {
    const present = new Set(group.games.map(g => g.field).filter(Boolean) as string[])
    return FIELD_ORDER.filter(f => present.has(f))
  }, [group.games])

  const grid = useMemo(() => {
    const map = new Map<string, Map<string, (typeof group.games)[number]>>()
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
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 ${isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/60'}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-sm font-bold text-slate-800">{group.label}</span>
            {group.date && (
              <span className="text-xs text-slate-400">{fmtDate(group.date)}</span>
            )}
            {theme && (
              <span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[0.6rem] font-semibold text-green-700 truncate">
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

          {/* Timetable */}
          <div>
            <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-widest text-slate-400">
              Timetable
            </p>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="border-collapse text-xs" style={{ minWidth: 'max-content', width: '100%' }}>
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="sticky left-0 z-[1] bg-white pb-2 pl-4 pr-3 text-right text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 w-[4.5rem]">
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="size-3" /> Time
                      </span>
                    </th>
                    {fieldsPresent.map(f => (
                      <th key={f} className="pb-2 px-1.5 pr-4 sm:pr-1.5 text-center text-[0.6rem] font-bold uppercase tracking-widest text-slate-400 min-w-[9rem]">
                        <span className="inline-flex items-center justify-center gap-1">
                          <MapPin className="size-2.5 shrink-0" />{f}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time} className="align-top">
                      <td className="sticky left-0 z-[1] bg-white pl-4 pr-3 pt-1.5 pb-2 text-right tabular-nums font-semibold text-slate-500 whitespace-nowrap">
                        {time}
                      </td>
                      {fieldsPresent.map((field, i) => {
                        const game = grid.get(time)?.get(field)
                        const isLast = i === fieldsPresent.length - 1
                        return (
                          <td key={field} className={`px-1.5 pt-1.5 pb-2 ${isLast ? 'pr-4 sm:pr-1.5' : ''}`}>
                            {game
                              ? <TimetableCell game={game} teams={teams} scores={scores} />
                              : <div className="flex h-full min-h-[3rem] items-center justify-center text-slate-200 select-none">·</div>
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
