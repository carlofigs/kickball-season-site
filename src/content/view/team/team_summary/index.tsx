import type { ScheduleData } from '../../../../types/schedule';
import { darkenColor } from '../../../../schedule_utils';

type Props = {
  teams: ScheduleData['teams'];
  schedule: ScheduleData;
  team: string;
};

export function TeamSummary({ teams, schedule, team }: Props) {
  const setupGames = schedule.games
    .filter((game) => game.fieldSetupTeams.includes(team))
    .map((game) => game.gameNumber);
  const packdownGames = schedule.games
    .filter((game) => game.fieldPackDownTeams.includes(team))
    .map((game) => game.gameNumber);

  let headingColor = teams[team].color;
  if (team === 'Apple') {
    headingColor = darkenColor(teams[team].color);
  }

  return (
    <div className="w-full mb-4">
      <div
        className={
          'relative w-full overflow-hidden rounded-xl border border-slate-900/[0.08] p-4 pt-5 ' +
          'bg-[linear-gradient(165deg,var(--accent-light)_0%,#f8fafc_42%,#f1f5f9_100%)] ' +
          'shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] ' +
          "before:content-[''] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[5px] " +
          'before:bg-[linear-gradient(90deg,var(--accent),var(--accent-dark))]'
        }
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">
          Your team
        </p>
        <h2 className="text-lg font-bold mb-3" style={{ color: headingColor }}>
          {teams[team].emoji} {team} · {teams[team].name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
          <div className="rounded-lg bg-white/60 px-3 py-2 border border-slate-200/80">
            <span className="font-semibold text-slate-600">Field Setup:</span>{' '}
            <span>
              {setupGames.length
                ? setupGames.map((gameNumber) => `Game ${gameNumber}`).join(', ')
                : 'None'}
            </span>
          </div>
          <div className="rounded-lg bg-white/60 px-3 py-2 border border-slate-200/80">
            <span className="font-semibold text-slate-600">Pack Down:</span>{' '}
            <span>
              {packdownGames.length
                ? packdownGames.map((gameNumber) => `Game ${gameNumber}`).join(', ')
                : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
