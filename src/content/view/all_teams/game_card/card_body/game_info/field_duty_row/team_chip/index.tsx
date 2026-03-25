import type { ScheduleData } from '../../../../../../../../types/schedule';
import {
  hrefForTeamDeepLink,
  teamColor,
  teamPillLabelColor,
} from '../../../../../../../../schedule_utils';

type Props = {
  teams: ScheduleData['teams'];
  team: string;
};

export function TeamChip({ teams, team }: Props) {
  return (
    <a
      href={hrefForTeamDeepLink(team)}
      className="inline-flex items-center rounded-md border border-slate-900/[0.1] px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none whitespace-nowrap no-underline transition-opacity hover:opacity-90 focus-visible:rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900/25"
      style={{
        background: teamColor(teams, team),
        color: teamPillLabelColor(teams, team),
      }}
      aria-label={`View schedule for ${team}`}
    >
      {team}
    </a>
  );
}
