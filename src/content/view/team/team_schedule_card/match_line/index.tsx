import { Clock, Crosshair, Droplets, Navigation, Store } from 'lucide-react';
import type { PitchField } from '../../../../../types/schedule';

const FIELD_ICONS: Record<PitchField, typeof Store> = {
  Kiosk: Store,
  Road: Navigation,
  Middle: Crosshair,
  Water: Droplets,
};

type Props = {
  time: string;
  field: PitchField;
};

export function TeamScheduleMatchLine({ time, field }: Props) {
  const FieldIcon = FIELD_ICONS[field];
  return (
    <div className="min-h-0 flex-1 px-1">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="inline-flex min-w-[4.5rem] items-center gap-1.5 text-[0.9375rem] font-extrabold tabular-nums text-slate-900">
          <Clock className="size-[13px] shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
          <span>{time}</span>
        </div>
        <div className="inline-flex items-center gap-[0.3rem] rounded-md bg-slate-200 px-[0.55rem] py-[0.3rem] text-[0.65rem] font-semibold text-slate-600">
          <FieldIcon className="size-[11px] shrink-0" aria-hidden />
          <span>{field} Field</span>
        </div>
      </div>
    </div>
  );
}
