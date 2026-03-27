import type { ScheduleData } from '../../../../types/schedule';
import { darkenColor } from '../../../../schedule_utils';
import { TeamDutiesPanel } from './team_duties_panel';

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
  const lineRefGames = schedule.games
    .filter((game) =>
      game.matches.some((block) =>
        block.fixtures.some((fixture) => fixture.lineRefTeams.includes(team))
      )
    )
    .map((game) => game.gameNumber);

  let headingColor = teams[team].color;
  if (team === 'Apple') {
    headingColor = darkenColor(teams[team].color);
  }

  return (
    <div className="w-full mb-4">
      <div
        className={
          'relative w-full overflow-hidden rounded-xl border border-slate-900/[0.08] p-3 pt-4 sm:p-4 sm:pt-4 ' +
          'bg-[linear-gradient(165deg,var(--accent-light)_0%,#f8fafc_42%,#f1f5f9_100%)] ' +
          'shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.75)] ' +
          "before:content-[''] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[4px] " +
          'before:bg-[linear-gradient(90deg,var(--accent),var(--accent-dark))]'
        }
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">
          Your team
        </p>
        <h2 className="text-base font-bold sm:text-lg" style={{ color: headingColor }}>
          {teams[team].emoji} {team} · {teams[team].name}
        </h2>
        <TeamDutiesPanel
          setupGames={setupGames}
          packdownGames={packdownGames}
          lineRefGames={lineRefGames}
        />
      </div>
    </div>
  );
}
