import type { LucideIcon } from 'lucide-react';
import type { ScheduleData } from '../../types/schedule';
import { TeamChip } from './team_chip';

type DutyVariant = 'setup' | 'pack' | 'lineRef';

const VARIANT_LABEL: Record<DutyVariant, string> = {
  setup: 'Field Setup',
  pack: 'Field Pack Down',
  lineRef: 'Line Ref',
};

const ACCENT: Record<DutyVariant, { iconWrap: string; icon: string }> = {
  setup: {
    iconWrap: 'bg-emerald-50',
    icon: 'text-emerald-700',
  },
  pack: {
    iconWrap: 'bg-amber-50',
    icon: 'text-amber-900',
  },
  lineRef: {
    iconWrap: 'bg-indigo-50',
    icon: 'text-indigo-800',
  },
};

type Props = {
  teams: ScheduleData['teams'];
  /** Omit when the row should not show a time (e.g. match sheet line ref). */
  time?: string;
  teamNames: string[];
  Icon: LucideIcon;
  variant: DutyVariant;
  /**
   * When true, label + chips share one row (match sheet): vertically centered,
   * chips right-aligned. Default: stacked layout for game card duties.
   */
  inlineTeamChips?: boolean;
};

export function FieldDutyRow({
  teams,
  time,
  teamNames,
  Icon,
  variant,
  inlineTeamChips = false,
}: Props) {
  const label = VARIANT_LABEL[variant];
  const accentClasses = ACCENT[variant];
  const showTime = time != null && time !== '';

  const labelText = (
    <span className="text-[0.8125rem] font-semibold leading-tight text-slate-600">
      {label}
      {showTime ? (
        <>
          {' '}
          <span className="font-medium text-slate-500 tabular-nums">{time}</span>
        </>
      ) : null}
    </span>
  );

  const chipList = (
    <ul
      className={
        inlineTeamChips
          ? 'm-0 flex min-w-0 flex-1 list-none flex-wrap items-center justify-end gap-1 p-0'
          : 'flex w-full list-none flex-wrap gap-1 sm:w-auto sm:flex-1 sm:justify-end sm:pl-2'
      }
      aria-label={`${label}: teams`}
    >
      {teamNames.map((teamName) => (
        <li key={teamName}>
          <TeamChip teams={teams} team={teamName} />
        </li>
      ))}
    </ul>
  );

  if (inlineTeamChips) {
    return (
      <div className="flex min-w-0 flex-nowrap items-center justify-between gap-x-2 px-2 py-2 sm:px-2.5">
        <div className="flex shrink-0 items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${accentClasses.iconWrap}`}
          >
            <Icon className={`size-3.5 ${accentClasses.icon}`} strokeWidth={2} aria-hidden />
          </div>
          {labelText}
        </div>
        {chipList}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 py-2 px-2 sm:justify-between sm:gap-x-3 sm:px-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${accentClasses.iconWrap}`}
        >
          <Icon className={`size-3.5 ${accentClasses.icon}`} strokeWidth={2} aria-hidden />
        </div>
        {labelText}
      </div>
      {chipList}
    </div>
  );
}
