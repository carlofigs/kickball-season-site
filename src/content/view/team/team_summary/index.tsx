import type { ScheduleData } from '../../../../types/schedule';
import { darkenColor } from '../../../../utils/schedule';
import { TeamDutiesPanel } from './team_duties_panel';

type Props = {
  teams: ScheduleData['teams'];
  schedule: ScheduleData;
  team: string;
  schedulePageLoadedAt: Date;
};

// HACK for accessibility for odd colours
const HACK_COLOUR_ACCESSIBILITY_TEAMS = ['Apple', 'Lilac'];

export function TeamSummary({ teams, schedule, team, schedulePageLoadedAt }: Props) {
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
  if (HACK_COLOUR_ACCESSIBILITY_TEAMS.includes(team)) {
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
        <div className="mb-1 flex flex-nowrap items-start justify-between gap-x-4">
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">
              Your team
            </p>
            <h2
              className="team-summary-heading text-base font-bold sm:text-lg"
              style={{ color: headingColor }}
            >
              {teams[team].emoji} {team} · {teams[team].name}
            </h2>
          </div>
          <p
            className="team-schedule-export-only mt-0.5 max-w-[min(100%,16rem)] shrink-0 text-right text-sm leading-snug text-slate-500"
            aria-hidden
          >
            Last updated at {formatPageLoadedTimestamp(schedulePageLoadedAt)}
          </p>
        </div>
        <TeamDutiesPanel
          setupGames={setupGames}
          packdownGames={packdownGames}
          lineRefGames={lineRefGames}
        />
      </div>
    </div>
  );
}

/** DD/MM/YYYY HH:MM AM/PM in local time (PNG export stamp — page load = data freshness). */
function formatPageLoadedTimestamp(value: Date): string {
  const day = String(value.getDate()).padStart(2, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const year = value.getFullYear();
  const hour24 = value.getHours();
  const minutes = String(value.getMinutes()).padStart(2, '0');
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  const hour = String(hour12).padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minutes} ${ampm}`;
}
