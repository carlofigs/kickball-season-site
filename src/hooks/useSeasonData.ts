import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { DbSeason, DbSeasonTeam, DbGame, DbGameScore, SeasonData } from '../types/schedule'

interface UseSeasonDataResult {
  data: SeasonData | null
  loading: boolean
  error: string | null
}

/**
 * Fetches all data GLINDA needs for the active season from Supabase.
 *
 * Runs four queries in parallel:
 *   1. seasons          — active season config + divisions array
 *   2. season_teams     — team metadata (display_name, color_hex, division, etc.)
 *   3. games            — all season fixtures (context_type = 'season')
 *   4. game_scores      — scores keyed by game_uuid (via game id list)
 *
 * Returns data as a SeasonData bundle with lookup maps pre-built.
 * Empty game_scores (pre-ELPHABA) is valid — standings show zeroes.
 */
export function useSeasonData(): UseSeasonDataResult {
  const [data, setData] = useState<SeasonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured. Check environment variables.')
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        // Step 1 — active season
        const { data: seasonRows, error: seasonErr } = await supabase!
          .from('seasons')
          .select('season_id, name, year, start_date, end_date, divisions, is_active')
          .eq('is_active', true)
          .limit(1)
          .single()

        if (seasonErr) throw new Error(`seasons: ${seasonErr.message}`)
        const season = seasonRows as DbSeason

        // Steps 2 & 3 — teams + games in parallel
        const [teamsResult, gamesResult] = await Promise.all([
          supabase!
            .from('season_teams')
            .select('season_id, team_color, display_name, emoji, color_hex, pill_label_color, division')
            .eq('season_id', season.season_id),
          supabase!
            .from('games')
            .select('id, context_type, context_id, game_number, team_a, team_b, status, game_day_number, match_time, scheduled_at, field, line_ref_teams')
            .eq('context_type', 'season')
            .eq('context_id', season.season_id)
            .order('game_day_number', { ascending: true })
            .order('match_time', { ascending: true }),
        ])

        if (teamsResult.error) throw new Error(`season_teams: ${teamsResult.error.message}`)
        if (gamesResult.error) throw new Error(`games: ${gamesResult.error.message}`)

        const teamRows = (teamsResult.data ?? []) as DbSeasonTeam[]
        const gameRows = (gamesResult.data ?? []) as DbGame[]

        // Step 4 — scores (by game uuid list; empty list = no scores yet)
        const gameIds = gameRows.map((g) => g.id)
        let scoreRows: DbGameScore[] = []

        if (gameIds.length > 0) {
          const { data: scoreData, error: scoreErr } = await supabase!
            .from('game_scores')
            .select('game_uuid, score_a, score_b')
            .in('game_uuid', gameIds)

          if (scoreErr) throw new Error(`game_scores: ${scoreErr.message}`)
          scoreRows = (scoreData ?? []) as DbGameScore[]
        }

        if (cancelled) return

        // Build lookup maps
        const teams: Record<string, DbSeasonTeam> = {}
        for (const t of teamRows) teams[t.team_color] = t

        const scores: Record<string, DbGameScore> = {}
        for (const s of scoreRows) scores[s.game_uuid] = s

        setData({ season, teams, games: gameRows, scores })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error loading season data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
