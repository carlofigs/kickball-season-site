import { CalendarDays } from 'lucide-react'

/**
 * Schedule view — placeholder for GLINDA-03.
 * Replace this component with the full schedule implementation in the next sprint.
 */
export function ScheduleView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50">
        <CalendarDays className="size-7 text-indigo-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-700">Schedule coming in GLINDA-03</p>
        <p className="text-xs text-slate-400">Full game-day schedule, field duties, and team filter.</p>
      </div>
    </div>
  )
}
