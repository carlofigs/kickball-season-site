import type { DbGame, DbGameScore, DbSeasonTeam, StandingsRow } from '../types/schedule'
import { teamKey } from '../content/view/schedule/_helpers'

interface TeamAccumulator {
  played: number
  won: number
  drawn: number
  lost: number
  points: number
  runsScored: number
}

/**
 * Computes standings from raw game + score data.
 *
 * Rules: W = 3 pts, D = 1 pt, L = 0 pts.
 * Tiebreaker: total runs scored (not differential).
 *
 * A game only counts if:
 *   - both team_a and team_b are non-null
 *   - a score row exists with non-null score_a and score_b
 *
 * Returns one sorted StandingsRow[] per division key from `divisions`.
 * Teams whose division doesn't appear in `divisions` are omitted.
 */
export function computeStandings(
  games: DbGame[],
  scores: Record<string, DbGameScore>,
  teams: Record<string, DbSeasonTeam>,
  divisions: string[],
): Record<string, StandingsRow[]> {
  // Initialise accumulator keyed by compound key (same format as the teams map).
  const acc: Record<string, TeamAccumulator> = {}
  for (const ck of Object.keys(teams)) {
    acc[ck] = { played: 0, won: 0, drawn: 0, lost: 0, points: 0, runsScored: 0 }
  }

  // Process each scored game — look up accumulator via compound key so
  // Open and Guardians same-color teams are tracked independently.
  for (const game of games) {
    if (!game.team_a || !game.team_b) continue
    const score = scores[game.uuid]
    if (!score || score.score_a == null || score.score_b == null) continue

    const a = acc[teamKey(game.team_a, game.division)]
    const b = acc[teamKey(game.team_b, game.division)]
    if (!a || !b) continue

    a.played++
    b.played++
    a.runsScored += score.score_a
    b.runsScored += score.score_b

    if (score.score_a > score.score_b) {
      a.won++
      a.points += 3
      b.lost++
    } else if (score.score_b > score.score_a) {
      b.won++
      b.points += 3
      a.lost++
    } else {
      a.drawn++
      a.points++
      b.drawn++
      b.points++
    }
  }

  // Build result: one sorted array per division
  const result: Record<string, StandingsRow[]> = {}

  for (const div of divisions) {
    const divTeams = Object.values(teams).filter((t) => t.division === div)

    result[div] = divTeams
      .map((team): StandingsRow => {
        const stats = acc[teamKey(team.team_color, team.division)] ?? {
          played: 0, won: 0, drawn: 0, lost: 0, points: 0, runsScored: 0,
        }
        return {
          teamColor: team.team_color,
          displayName: team.display_name ?? team.team_color,
          emoji: team.emoji ?? '',
          colorHex: team.color_hex ?? '#94a3b8',
          division: team.division ?? div,
          ...stats,
        }
      })
      .sort((a, b) =>
        b.won - a.won ||
        b.drawn - a.drawn ||
        b.runsScored - a.runsScored
      )
  }

  return result
}
