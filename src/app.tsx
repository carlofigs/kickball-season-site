import { useSeasonData } from './hooks/useSeasonData'

/**
 * GLINDA — App root.
 *
 * Data is fetched from Supabase via useSeasonData(). The schedule and
 * standings views (GLINDA-02 / GLINDA-03) are built in subsequent tasks.
 *
 * TODO GLINDA-02: replace loading/error/placeholder with standings + schedule UI.
 */
export function App() {
  const { data, loading, error } = useSeasonData()

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

  // Data is available — views built in GLINDA-02 (standings) and GLINDA-03 (schedule)
  const { season, teams, games, scores } = data

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Placeholder — replaced by Header + standings/schedule views in GLINDA-02/03 */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <p className="text-slate-400 text-sm text-center">
          {season.name} · {Object.keys(teams).length} teams · {games.length} fixtures ·{' '}
          {Object.keys(scores).length} results
        </p>
      </main>
    </div>
  )
}
