import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { DbSeason, DbSeasonTeam, DbGame, DbGameScore, DbSeasonEvent, SeasonData } from '../types/schedule'

interface UseSeasonDataResult {
  data: SeasonData | null
  loading: boolean
  error: string | null
}

/**
 * Fetches all data GLINDA needs for the active season from Supabase.
 *
 * Runs five queries in parallel (after active season is resolved):
 *   1. seasons          — active season config + divisions array
 *   2. season_teams     — team metadata (display_name, color_hex, division, etc.)
 *   3. games            — all season fixtures (context_type = 'season')
 *   4. game_scores      — scores keyed by game_uuid (via game id list)
 *   5. season_events    — calendar items driving schedule timeline grouping
 *
 * Returns data as a SeasonData bundle with lookup maps pre-built.
 * Empty game_scores (pre-ELPHABA) is valid — standings show zeroes.
 * Empty season_events falls back gracefully — schedule groups by game_day_number.
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
          .maybeSingle()

        if (seasonErr) throw new Error(`seasons: ${seasonErr.message}`)
        if (!seasonRows) throw new Error('seasons: no active season found — set is_active = true on the current season row')
        const season = seasonRows as DbSeason

        // Steps 2, 3 & 5 — teams, games, season_events in parallel
        const [teamsResult, gamesResult, eventsResult] = await Promise.all([
          supabase!
            .from('season_teams')
            .select('season_id, team_color, display_name, emoji, color_hex, pill_label_color, division')
            .eq('season_id', season.season_id),
          supabase!
            .from('games')
            .select('uuid, context_type, context_id, game_number, team_a, team_b, status, game_day_number, event_id, match_time, scheduled_at, field, line_ref_teams, field_setup_teams, field_packdown_teams, game_day_theme, game_day_theme_desc')
            .eq('context_type', 'season')
            .eq('context_id', season.season_id)
            .order('game_day_number', { ascending: true })
            .order('match_time', { ascending: true }),
          supabase!
            .from('season_events')
            .select('event_uuid, season_id, week_label, division, event_name, event_date, sort_order')
            .eq('season_id', season.season_id)
            .order('sort_order', { ascending: true }),
        ])

        if (teamsResult.error) throw new Error(`season_teams: ${teamsResult.error.message}`)
        if (gamesResult.error) throw new Error(`games: ${gamesResult.error.message}`)
        if (eventsResult.error) throw new Error(`season_events: ${eventsResult.error.message}`)

        const teamRows = (teamsResult.data ?? []) as DbSeasonTeam[]
        const gameRows = (gamesResult.data ?? []) as DbGame[]
        const eventRows = (eventsResult.data ?? []) as DbSeasonEvent[]

        // Step 4 — scores (by game uuid list; empty list = no scores yet)
        const gameIds = gameRows.map((g) => g.uuid)
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

        setData({ season, teams, games: gameRows, scores, events: eventRows })
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
