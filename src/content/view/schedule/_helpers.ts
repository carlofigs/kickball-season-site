import type { DbGame } from '../../../types/schedule'

// ─── Constants ────────────────────────────────────────────────────────────────

export const FIELD_ORDER = ['Road', 'Middle', 'Kiosk', 'Water']

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventLabel {
  eventName: string | null
  division: string | null
}

export interface CalendarGroup {
  key: string
  weekLabel: string
  date: string | null
  sortOrder: number
  eventLabels: EventLabel[]  // per-division sub-labels shown in accordion header
  games: DbGame[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseMatchTime(t: string): number {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return NaN
  let h = parseInt(m[1])
  const min = parseInt(m[2])
  const pm = m[3].toUpperCase() === 'PM'
  if (pm && h !== 12) h += 12
  if (!pm && h === 12) h = 0
  return h * 60 + min
}

export function fmtMinutes(total: number): string {
  const clamped = ((total % 1440) + 1440) % 1440
  const h24 = Math.floor(clamped / 60)
  const m = clamped % 60
  const h12 = h24 % 12 || 12
  const period = h24 >= 12 ? 'PM' : 'AM'
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function dutyTimes(games: DbGame[]): { setup: string | null; packdown: string | null } {
  const mins = games
    .map(g => g.match_time ? parseMatchTime(g.match_time) : NaN)
    .filter(n => !isNaN(n))
  if (!mins.length) return { setup: null, packdown: null }
  return {
    setup: fmtMinutes(Math.min(...mins) - 60),
    packdown: fmtMinutes(Math.max(...mins) + 60),
  }
}
