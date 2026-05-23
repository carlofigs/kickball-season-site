import { useMemo, Fragment } from 'react'
import { ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react'
import type { SeasonData } from '../../../types/schedule'
import { teamKey, FIELD_ORDER, type CalendarGroup, parseMatchTime, fmtDate, dutyTimes } from './_helpers'
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
  const hasGames = group.games.length > 0

  // Duty team lists carry {color, division} so DutiesTable can resolve hex via compound key.
  // Using teamKey as the dedup key ensures Open and Guardians same-color teams are distinct.
  const setupTeams = useMemo(() => {
    const seen = new Map<string, { color: string; division: string | null }>()
    for (const g of group.games)
      for (const c of g.field_setup_teams ?? []) {
        const ck = teamKey(c, g.division)
        if (!seen.has(ck)) seen.set(ck, { color: c, division: g.division ?? null })
      }
    return [...seen.values()]
  }, [group.games])

  const packdownTeams = useMemo(() => {
    const seen = new Map<string, { color: string; division: string | null }>()
    for (const g of group.games)
      for (const c of g.field_packdown_teams ?? []) {
        const ck = teamKey(c, g.division)
        if (!seen.has(ck)) seen.set(ck, { color: c, division: g.division ?? null })
      }
    return [...seen.values()]
  }, [group.games])

  const lineRefByTime = useMemo((): Array<[string, Array<{ color: string; division: string | null }>]> => {
    const map = new Map<string, Map<string, { color: string; division: string | null }>>()
    for (const g of group.games) {
      if (!g.line_ref_teams?.length || !g.match_time) continue
      if (!map.has(g.match_time)) map.set(g.match_time, new Map())
      const slot = map.get(g.match_time)!
      for (const c of g.line_ref_teams) {
        const ck = teamKey(c, g.division)
        if (!slot.has(ck)) slot.set(ck, { color: c, division: g.division ?? null })
      }
    }
    return [...map.entries()]
      .sort(([a], [b]) => parseMatchTime(a) - parseMatchTime(b))
      .map(([time, slot]) => [time, [...slot.values()]])
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

  // Group consecutive time slots by division so we can render section headers + shading.
  // Open and Guardians never share a time slot, so each slot belongs to exactly one division.
  const divisionRuns = useMemo(() => {
    const runs: Array<{ division: string | null; times: string[] }> = []
    for (const time of timeSlots) {
      const slot = grid.get(time)
      const div = slot ? [...slot.values()].find(Boolean)?.division ?? null : null
      const last = runs[runs.length - 1]
      if (last && last.division === div) last.times.push(time)
      else runs.push({ division: div, times: [time] })
    }
    return runs
  }, [timeSlots, grid])

  // O(1) per-time lookup: is this the first slot in its division run?
  const timeRunMap = useMemo(() => {
    const m = new Map<string, { division: string | null; isFirst: boolean }>()
    for (const run of divisionRuns)
      run.times.forEach((t, i) => m.set(t, { division: run.division, isFirst: i === 0 }))
    return m
  }, [divisionRuns])

  // Only render division section headers when the group contains multiple divisions.
  const showDivHeaders = divisionRuns.length > 1

  const meta = group.games[0]
  const theme = meta?.game_day_theme ?? null
  const themeDesc = meta?.game_day_theme_desc ?? null

  // ── Shared header content ────────────────────────────────────────────────────
  const headerContent = (
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-sm font-bold text-slate-800">{group.weekLabel}</span>
        {group.date && (
          <span className="text-xs text-slate-400">{fmtDate(group.date)}</span>
        )}
        {group.eventLabels.map((el, i) => (
          <span
            key={i}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.6rem] font-semibold text-slate-500 truncate"
          >
            {[el.eventName, el.division].filter(Boolean).join(' · ')}
          </span>
        ))}
      </div>
    </div>
  )

  // ── Non-game event — non-expandable tile ─────────────────────────────────────
  if (!hasGames) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5">
          {headerContent}
        </div>
      </div>
    )
  }

  // ── Game week — expandable accordion ─────────────────────────────────────────
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500 ${isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/60'}`}
      >
        {headerContent}
        {isOpen
          ? <ChevronUp className="shrink-0 size-4 text-slate-400" />
          : <ChevronDown className="shrink-0 size-4 text-slate-400" />
        }
      </button>

      {/* Body */}
      {isOpen && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
          {/* Theme block — only when game_day_theme is set */}
          {(theme || themeDesc) && (
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 space-y-0.5">
              {theme && (
                <p className="text-xs font-semibold text-slate-700">{theme}</p>
              )}
              {themeDesc && (
                <p className="text-xs text-slate-400">{themeDesc}</p>
              )}
            </div>
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
                  {timeSlots.map(time => {
                    const info = timeRunMap.get(time) ?? { division: null, isFirst: false }
                    const isGuardians = info.division === 'Guardians'
                    // Sticky cells need an opaque bg to cover scrolled content.
                    const timeBg = isGuardians ? 'bg-amber-50' : 'bg-white'
                    const rowBg = isGuardians ? 'bg-amber-50/50' : ''
                    return (
                      <Fragment key={time}>
                        {/* Division section header — only when multiple divisions are present */}
                        {showDivHeaders && info.isFirst && (
                          <tr className={isGuardians ? 'bg-amber-100/60' : 'bg-green-50/80'}>
                            <td
                              colSpan={fieldsPresent.length + 1}
                              className="pl-4 pr-3 py-1"
                            >
                              <div className="flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-widest">
                                {isGuardians ? (
                                  <span className="text-amber-600">Guardians</span>
                                ) : (
                                  <>
                                    <span className="text-green-600">Elphaba</span>
                                    <span className="text-slate-400">·</span>
                                    <span className="text-pink-500">Glinda</span>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                        <tr className={`align-top ${rowBg}`}>
                          <td className={`sticky left-0 z-[1] ${timeBg} pl-4 pr-3 pt-1.5 pb-2 text-right tabular-nums font-semibold text-slate-500 whitespace-nowrap`}>
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
                      </Fragment>
                    )
                  })}
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
