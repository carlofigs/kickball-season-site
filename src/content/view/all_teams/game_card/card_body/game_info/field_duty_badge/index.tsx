import type { LucideIcon } from 'lucide-react';
import type { ScheduleData } from '../../../../../../../types/schedule';
import { TeamChip } from './team_chip';

type DutyVariant = 'setup' | 'pack';

const VARIANT_CLASS: Record<DutyVariant, string> = {
  setup: 'bg-emerald-100 text-emerald-800',
  pack: 'bg-amber-100 text-amber-900',
};

const VARIANT_LABEL: Record<DutyVariant, string> = {
  setup: 'Field Setup',
  pack: 'Field Pack Down',
};

type Props = {
  teams: ScheduleData['teams'];
  time: string;
  teamNames: string[];
  Icon: LucideIcon;
  variant: DutyVariant;
};

export function FieldDutyBadge({ teams, time, teamNames, Icon, variant }: Props) {
  return (
    <span
      className={
        `flex w-full max-w-full flex-col gap-1.5 rounded-2xl px-2.5 py-2 text-xs font-semibold ` +
        `sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1 sm:rounded-full sm:px-3 sm:py-2 ` +
        VARIANT_CLASS[variant]
      }
    >
      <span className="inline-flex min-w-0 shrink-0 items-center gap-1">
        <Icon className="size-3 shrink-0" aria-hidden />
        <span className="leading-tight">
          {VARIANT_LABEL[variant]} {time}
        </span>
      </span>
      <span className="inline-flex min-w-0 flex-1 flex-wrap items-center gap-1">
        {teamNames.map((teamName) => (
          <TeamChip key={teamName} teams={teams} team={teamName} />
        ))}
      </span>
    </span>
  );
}
