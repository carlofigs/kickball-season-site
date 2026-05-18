/**
 * GLINDA — TypeScript types aligned to the GRIMMERIE Supabase schema.
 *
 * Column names verified against live migrations (GLINDA-01 spike, 2026-05-18).
 * Do NOT use the handoff SQL column names — several were incorrect.
 *
 * Raw DB types (snake_case) prefixed with `Db`.
 * App-layer types (camelCase) used by components.
 */

// ─── Raw DB row types ──────────────────────────────────────────────────────────

/** public.seasons row */
export interface DbSeason {
  season_id: string
  name: string
  year: number | null
  start_date: string | null      // "YYYY-MM-DD"
  end_date: string | null        // "YYYY-MM-DD"
  divisions: string[]            // e.g. ["Div1", "Div2"] — order = display order
  is_active: boolean
}

/**
 * public.season_teams row.
 * PK: (season_id, team_color) — no standalone `id` column.
 * `team_color` is the stable key matching team_a / team_b in games.
 */
export interface DbSeasonTeam {
  season_id: string
  team_color: string             // stable key — e.g. "Black", "Purple"
  display_name: string | null    // e.g. "Shade Brigade"
  emoji: string | null
  color_hex: string | null       // primary brand colour e.g. "#1a1a2e"
  pill_label_color: string | null
  division: string | null        // "Div1" | "Div2" | "Guardian"
}

/**
 * public.games row — season rows only (context_type = 'season').
 */
export interface DbGame {
  id: string                     // uuid — FK target for game_scores.game_uuid
  context_type: 'season'
  context_id: string             // season_id
  game_number: number
  team_a: string | null          // team_color key
  team_b: string | null          // team_color key
  status: 'scheduled' | 'in_progress' | 'complete' | 'cancelled'
  game_day_number: number | null // groups fixtures by game day (1–7)
  match_time: string | null      // display time — "3:00 PM" | "4:00 PM"
  scheduled_at: string | null    // ISO timestamptz
  field: string | null           // "Road" | "Middle" | "Kiosk" | "Water"
  line_ref_teams: string[] | null // team_color keys providing line ref
}

/**
 * public.game_scores row.
 * Written by ELPHABA. Join via game_uuid = games.id.
 * score_a = team_a's score, score_b = team_b's score.
 */
export interface DbGameScore {
  game_uuid: string
  score_a: number | null
  score_b: number | null
}

// ─── App-layer bundle ─────────────────────────────────────────────────────────

/** Top-level data bundle returned by useSeasonData(). */
export interface SeasonData {
  season: DbSeason
  /** Keyed by team_color for O(1) lookup. */
  teams: Record<string, DbSeasonTeam>
  games: DbGame[]
  /** Keyed by game_uuid for O(1) lookup. */
  scores: Record<string, DbGameScore>
}

// ─── Computed standings ───────────────────────────────────────────────────────

/** One row in a standings table — built by computeStandings() in GLINDA-02. */
export interface StandingsRow {
  teamColor: string
  displayName: string
  emoji: string
  colorHex: string
  pillLabelColor: string
  division: string
  played: number
  won: number
  drawn: number
  lost: number
  points: number       // W×3 + D×1
  runsScored: number   // tiebreaker (total, not differential)
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export type PitchField = 'Road' | 'Middle' | 'Kiosk' | 'Water'
