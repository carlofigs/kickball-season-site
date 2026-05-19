import { Clock, MapPin, Wrench, Package, Flag } from 'lucide-react'
import type { SeasonData, DbGame } from '../../../types/schedule'
import { fmtDate, dutyTimes } from './_helpers'

type Props = {
  game: DbGame
  teamColor: string
  teams: SeasonData['teams']
  scores: SeasonData['scores']
}

export function TeamGameCard({ game, teamColor, teams, scores }: Props) {
  const isTeamA = game.team_a === teamColor
  const opponentColor = isTeamA ? game.team_b : game.team_a
  const opponent = opponentColor ? teams[opponentColor] : null
  const oppHex = opponent?.color_hex ?? '#94a3b8'

  const score = scores[game.uuid]
  const hasScore = score && score.score_a != null && score.score_b != null
  const myScore = hasScore ? (isTeamA ? score.score_a : score.score_b) : null
  const theirScore = hasScore ? (isTeamA ? score.score_b : score.score_a) : null
  const iWon = myScore !== null && theirScore !== null && myScore > theirScore!
  const theyWon = myScore !== null && theirScore !== null && theirScore! > myScore

  const isOnSetup = game.field_setup_teams?.includes(teamColor) ?? false
  const isOnPackdown = game.field_packdown_teams?.includes(teamColor) ?? false
  const isOnLineRef = game.line_ref_teams?.includes(teamColor) ?? false
  const { setup: setupTime, packdown: packdownTime } = dutyTimes([game])

  return (
    <div
      className="rounded-xl border bg-white overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
      style={{ borderColor: `${oppHex}40` }}
    >
      <div className="h-1.5" style={{ backgroundColor: oppHex }} />
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            Game Day {game.game_day_number}
          </span>
          {game.scheduled_at && (
            <span className="text-xs text-slate-400">
              {fmtDate(game.scheduled_at.substring(0, 10))}
            </span>
          )}
          {opponentColor && (
            <span
              className="ml-auto rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold truncate max-w-[180px]"
              style={{ backgroundColor: `${oppHex}22`, color: oppHex }}
            >
              {opponent?.display_name
                ? `${opponentColor} · ${opponent.display_name}`
                : opponentColor}
            </span>
          )}
        </div>

        {/* Theme */}
        {game.game_day_theme && (
          <div>
            <p className="text-xs font-semibold text-slate-600">{game.game_day_theme}</p>
            {game.game_day_theme_desc && (
              <p className="text-[0.7rem] text-slate-400 italic mt-0.5">{game.game_day_theme_desc}</p>
            )}
          </div>
        )}

        {/* Time + field */}
        <div className="flex flex-wrap items-center gap-2">
          {game.match_time && (
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Clock className="size-3 text-slate-400" />
              {game.match_time}
            </span>
          )}
          {game.field && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
              <MapPin className="size-2.5" />
              {game.field}
            </span>
          )}
        </div>

        {/* Score */}
        {hasScore && (
          <div className={`flex items-baseline gap-1.5 text-lg font-extrabold tabular-nums ${iWon ? 'text-green-600' : theyWon ? 'text-slate-400' : 'text-slate-600'}`}>
            {myScore} – {theirScore}
            {iWon && <span className="text-[0.65rem] font-bold text-green-500 uppercase tracking-wide">W</span>}
            {theyWon && <span className="text-[0.65rem] font-bold text-red-400 uppercase tracking-wide">L</span>}
            {!iWon && !theyWon && <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wide">D</span>}
          </div>
        )}

        {/* Duty badges */}
        {(isOnSetup || isOnPackdown || isOnLineRef) && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
            {isOnSetup && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 border border-green-100 px-2 py-0.5 text-[0.65rem] font-semibold text-green-700">
                <Wrench className="size-2.5" /> Field Setup{setupTime ? ` · ${setupTime}` : ''}
              </span>
            )}
            {isOnPackdown && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                <Package className="size-2.5" /> Pack Down{packdownTime ? ` · ${packdownTime}` : ''}
              </span>
            )}
            {isOnLineRef && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600">
                <Flag className="size-2.5" /> Line Ref
                {game.match_time ? ` · ${game.match_time}` : ''}
                {game.field ? ` · ${game.field}` : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
