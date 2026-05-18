import { BarChart2, CalendarDays } from 'lucide-react'

export type AppTab = 'standings' | 'schedule'

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
}

export function TabBar({ activeTab, onTabChange }: Props) {
  return (
    <nav
      aria-label="View navigation"
      className="sticky top-0 z-10 border-b bg-white/[0.97] backdrop-blur-sm"
      style={{ borderBottomColor: 'var(--chrome-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex">
        {TABS.map(({ id, label, Icon }) => {
          const active = id === activeTab
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(id)}
              className={[
                'relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
                active
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              <Icon className={`size-[15px] ${active ? 'text-indigo-600' : ''}`} />
              {label}
              {/* Active underline */}
              {active && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-indigo-600"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
