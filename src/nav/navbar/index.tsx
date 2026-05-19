import { BarChart2, CalendarDays } from 'lucide-react'
import type { AppTab } from '../tab_bar'

type Tab = {
  id: AppTab
  label: string
  Icon: React.ComponentType<{ className?: string }>
}

const TABS: Tab[] = [
  { id: 'standings', label: 'Standings', Icon: BarChart2 },
  { id: 'schedule',  label: 'Schedule',  Icon: CalendarDays },
]

type Props = {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  seasonName: string
  stripeColors: string[]
}

export function Navbar({ activeTab, onTabChange, seasonName, stripeColors }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-black">
      {/* Logo row */}
      <div
        className="mx-auto flex max-w-7xl items-center gap-3 px-4 pb-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <span className="text-xl font-extrabold tracking-tight text-white">
          Kickball
        </span>
        <span className="inline-flex shrink-0 items-center rounded-full border border-green-500/40 bg-green-500/10 px-[0.6rem] py-[0.25rem] text-[0.6rem] font-bold uppercase tracking-[0.1em] text-green-400">
          {seasonName}
        </span>
      </div>

      {/* Tab row */}
      <nav
        aria-label="View navigation"
        className="border-t border-white/10"
      >
        <div className="mx-auto flex max-w-7xl px-4">
          {TABS.map(({ id, label, Icon }) => {
            const active = id === activeTab
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(id)}
                className={[
                  'relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-500',
                  active ? 'text-white' : 'text-white/50 hover:text-white/80',
                ].join(' ')}
              >
                <Icon className={`size-[15px] ${active ? 'text-green-500' : ''}`} />
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-green-500"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Rainbow stripe */}
      {stripeColors.length > 0 && (
        <div className="flex h-1 w-full">
          {stripeColors.map((hex, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
          ))}
        </div>
      )}
    </header>
  )
}
