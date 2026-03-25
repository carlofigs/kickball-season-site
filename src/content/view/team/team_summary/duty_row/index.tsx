import type { LucideIcon } from 'lucide-react';

type DutyAccent = 'emerald' | 'amber' | 'indigo';

const ACCENT: Record<
  DutyAccent,
  { dot: string; iconWrap: string; icon: string; chip: string; chipText: string }
> = {
  emerald: {
    dot: 'bg-emerald-500',
    iconWrap: 'bg-emerald-50',
    icon: 'text-emerald-700',
    chip: 'border-emerald-200/80 bg-emerald-50/80',
    chipText: 'text-emerald-900',
  },
  amber: {
    dot: 'bg-amber-500',
    iconWrap: 'bg-amber-50',
    icon: 'text-amber-900',
    chip: 'border-amber-200/80 bg-amber-50/80',
    chipText: 'text-amber-950',
  },
  indigo: {
    dot: 'bg-indigo-500',
    iconWrap: 'bg-indigo-50',
    icon: 'text-indigo-800',
    chip: 'border-indigo-200/80 bg-indigo-50/80',
    chipText: 'text-indigo-950',
  },
};

type Props = {
  title: string;
  Icon: LucideIcon;
  accent: DutyAccent;
  gameNumbers: number[];
};

export function DutyRow({ title, Icon, accent, gameNumbers }: Props) {
  const accentClasses = ACCENT[accent];
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 py-2 px-2 sm:justify-between sm:gap-x-3 sm:px-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accentClasses.dot}`} aria-hidden />
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${accentClasses.iconWrap}`}
        >
          <Icon className={`size-3.5 ${accentClasses.icon}`} strokeWidth={2} aria-hidden />
        </div>
        <span className="text-[0.8125rem] font-semibold leading-tight text-slate-600">{title}</span>
      </div>
      {gameNumbers.length > 0 ? (
        <ul className="flex flex-wrap gap-1 sm:justify-end sm:pl-2" aria-label={`${title}: games`}>
          {gameNumbers.map((gameNumber) => (
            <li key={gameNumber}>
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums leading-none ${accentClasses.chip} ${accentClasses.chipText}`}
              >
                Game {gameNumber}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-[0.75rem] tabular-nums text-slate-400">—</span>
      )}
    </div>
  );
}
