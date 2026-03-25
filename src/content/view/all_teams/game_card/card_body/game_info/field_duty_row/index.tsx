import type { LucideIcon } from 'lucide-react';
import type { ScheduleData } from '../../../../../../../types/schedule';
import { TeamChip } from './team_chip';

type DutyVariant = 'setup' | 'pack' | 'lineRef';

const VARIANT_LABEL: Record<DutyVariant, string> = {
  setup: 'Field Setup',
  pack: 'Field Pack Down',
  lineRef: 'Line Ref',
};

const ACCENT: Record<DutyVariant, { dot: string; iconWrap: string; icon: string }> = {
  setup: {
    dot: 'bg-emerald-500',
    iconWrap: 'bg-emerald-50',
    icon: 'text-emerald-700',
  },
  pack: {
    dot: 'bg-amber-500',
    iconWrap: 'bg-amber-50',
    icon: 'text-amber-900',
  },
  lineRef: {
    dot: 'bg-indigo-500',
    iconWrap: 'bg-indigo-50',
    icon: 'text-indigo-800',
  },
};

type Props = {
  teams: ScheduleData['teams'];
  time: string;
  teamNames: string[];
  Icon: LucideIcon;
  variant: DutyVariant;
};

/** One row — use inside a `divide-y` panel (see team summary `TeamDutiesPanel`). */
export function FieldDutyRow({ teams, time, teamNames, Icon, variant }: Props) {
  const label = VARIANT_LABEL[variant];
  const accentClasses = ACCENT[variant];

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 py-2 px-2 sm:justify-between sm:gap-x-3 sm:px-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accentClasses.dot}`} aria-hidden />
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${accentClasses.iconWrap}`}
        >
          <Icon className={`size-3.5 ${accentClasses.icon}`} strokeWidth={2} aria-hidden />
        </div>
        <span className="text-[0.8125rem] font-semibold leading-tight text-slate-600">
          {label} <span className="font-medium text-slate-500 tabular-nums">{time}</span>
        </span>
      </div>
      <ul
        className="flex w-full flex-wrap gap-1 sm:w-auto sm:flex-1 sm:justify-end sm:pl-2"
        aria-label={`${label}: teams`}
      >
        {teamNames.map((teamName) => (
          <li key={teamName}>
            <TeamChip teams={teams} team={teamName} />
          </li>
        ))}
      </ul>
    </div>
  );
}
