import type { ScheduleData } from '../../../../../../../../types/schedule';
import { teamColor, teamPillLabelColor } from '../../../../../../../../schedule_utils';

type Props = {
  teams: ScheduleData['teams'];
  team: string;
};

export function TeamChip({ teams, team }: Props) {
  return (
    <span
      className="inline-flex items-center rounded-full border border-slate-900/[0.07] px-2 py-0.5 text-[11px] font-bold leading-tight shadow-sm whitespace-nowrap"
      style={{
        background: teamColor(teams, team),
        color: teamPillLabelColor(teams, team),
      }}
    >
      {team}
    </span>
  );
}
