import { Clock } from 'lucide-react';
import type { PitchField } from '../../../../../types/schedule';
import { PitchFieldPill } from '../../../../../shared/pitch_field_pill';

type Props = {
  time: string;
  field: PitchField;
};

export function TeamScheduleMatchLine({ time, field }: Props) {
  return (
    <div className="shrink-0 px-1">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="inline-flex min-w-[4.5rem] items-center gap-1.5 text-[0.9375rem] font-extrabold tabular-nums text-slate-900">
          <Clock className="size-[13px] shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
          <span>{time}</span>
        </div>
        <PitchFieldPill fieldName={field} />
      </div>
    </div>
  );
}
