import { useState } from 'react'
import { useSeasonData } from './hooks/useSeasonData'
import { Navbar } from './nav/navbar'
import type { AppTab } from './nav/tab_bar'
import { StandingsView } from './content/view/standings'
import { ScheduleView } from './content/view/schedule'

export function App() {
  const { data, loading, error } = useSeasonData()
  const [activeTab, setActiveTab] = useState<AppTab>('standings')

  const seasonName = data?.season.name ?? 'Season'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Loading season data…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-medium text-sm">Failed to load season data</p>
          {error && <p className="text-slate-500 text-xs font-mono">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        seasonName={seasonName}
      />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {activeTab === 'standings' && <StandingsView data={data} />}
        {activeTab === 'schedule'  && <ScheduleView data={data} />}
      </main>
    </div>
  )
}
