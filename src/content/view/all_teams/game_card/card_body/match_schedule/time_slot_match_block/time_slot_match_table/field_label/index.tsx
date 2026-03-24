import type { ComponentType } from 'react';
import { Crosshair, Droplets, Navigation, Store } from 'lucide-react';
import type { PitchField } from '../../../../../../../../../types/schedule';

const FIELD_ICONS: Record<
  PitchField,
  ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  Kiosk: Store,
  Road: Navigation,
  Middle: Crosshair,
  Water: Droplets,
};

type Props = {
  fieldName: PitchField;
};

export function FieldLabel({ fieldName }: Props) {
  const Icon = FIELD_ICONS[fieldName];
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0">
      <Icon className="size-3 shrink-0 text-slate-400" aria-hidden />
      <span>{fieldName}</span>
    </span>
  );
}
