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

// Progress Pride stripe — same 6-colour sequence as FIYERO
const PRIDE_STRIPE = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787']

// Mint highlight — matches FIYERO's pride-mint token (#B8F6D0)
const MINT = '#B8F6D0'
const MINT_DEEP = '#064E3B'

type Props = {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  seasonName: string
}

export function Navbar({ activeTab, onTabChange, seasonName }: Props) {
  return (
    <header className="sticky top-0 z-10 bg-[#0a0a0a] shadow-md">
      {/* Pride stripe — top, 5px, same as FIYERO */}
      <div aria-hidden className="flex h-[5px] w-full">
        {PRIDE_STRIPE.map((hex, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
        ))}
      </div>

      {/* Logo row */}
      <div
        className="mx-auto flex max-w-7xl items-center gap-3 px-3 pb-2"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
      >
        <span className="text-xl font-extrabold tracking-tight text-white">
          Kickball
        </span>
        <span
          className="inline-flex shrink-0 items-center rounded-full border px-[0.6rem] py-[0.25rem] text-[0.6rem] font-bold uppercase tracking-[0.1em]"
          style={{
            borderColor: `${MINT}66`,
            backgroundColor: `${MINT}1a`,
            color: MINT,
          }}
        >
          {seasonName}
        </span>
      </div>

      {/* Tab nav — slightly darker strip, matching FIYERO's bg-neutral-900 */}
      <nav aria-label="View navigation" className="bg-neutral-900">
        <div className="mx-auto flex max-w-7xl px-4">
          {TABS.map(({ id, label, Icon }) => {
            const active = id === activeTab
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(id)}
                style={active ? { borderBottomColor: MINT } : {}}
                className={[
                  'flex-none whitespace-nowrap flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-[3px] border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                  active
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-neutral-200',
                ].join(' ')}
              >
                <span style={active ? { color: MINT } : undefined}>
                  <Icon className="size-[15px]" />
                </span>
                {label}
              </button>
            )
          })}
        </div>
      </nav>
    </header>
  )
}

export { MINT, MINT_DEEP }
