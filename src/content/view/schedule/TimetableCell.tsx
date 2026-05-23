import type { DbGame, SeasonData } from '../../../types/schedule'
import { teamKey } from './_helpers'

type Props = {
  game: DbGame
  teams: SeasonData['teams']
  scores: SeasonData['scores']
}

export function TimetableCell({ game, teams, scores }: Props) {
  const score = scores[game.uuid]
  const hasScore = score && score.score_a != null && score.score_b != null
  const aWon = hasScore && score.score_a! > score.score_b!
  const bWon = hasScore && score.score_b! > score.score_a!
  const tA = game.team_a ? teams[teamKey(game.team_a, game.division)] : null
  const tB = game.team_b ? teams[teamKey(game.team_b, game.division)] : null

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs h-full">
      {/* Team A */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="size-2 shrink-0 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: tA?.color_hex ?? '#94a3b8' }}
        />
        <span className={`truncate leading-tight ${aWon ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
          {game.team_a ?? '—'}
        </span>
        {hasScore && (
          <span className={`ml-auto shrink-0 tabular-nums ${aWon ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
            {score.score_a}
          </span>
        )}
      </div>
      <div className="my-1 border-t border-slate-100" />
      {/* Team B */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="size-2 shrink-0 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: tB?.color_hex ?? '#94a3b8' }}
        />
        <span className={`truncate leading-tight ${bWon ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
          {game.team_b ?? '—'}
        </span>
        {hasScore && (
          <span className={`ml-auto shrink-0 tabular-nums ${bWon ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
            {score.score_b}
          </span>
        )}
      </div>
    </div>
  )
}
