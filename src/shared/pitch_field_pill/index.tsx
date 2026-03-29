import type { ComponentType } from 'react';
import { Crosshair, Droplets, Navigation, Store } from 'lucide-react';
import type { PitchField } from '../../types/schedule';

const FIELD_ICONS: Record<
  PitchField,
  ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  Kiosk: Store,
  Road: Navigation,
  Middle: Crosshair,
  Water: Droplets,
};

export type PitchFieldPillSize = 'default' | 'large';

type Props = {
  fieldName: PitchField;
  size?: PitchFieldPillSize;
};

export function PitchFieldPill({ fieldName, size = 'default' }: Props) {
  const Icon = FIELD_ICONS[fieldName];
  const isLarge = size === 'large';
  return (
    <span
      className={
        isLarge
          ? 'inline-flex items-center gap-1.5 rounded-md bg-slate-200 px-2.5 py-1 text-sm font-semibold text-slate-600'
          : 'inline-flex items-center gap-[0.3rem] rounded-md bg-slate-200 px-[0.55rem] py-[0.3rem] text-[0.65rem] font-semibold text-slate-600'
      }
    >
      <Icon className={`shrink-0 ${isLarge ? 'size-3.5' : 'size-[11px]'}`} aria-hidden />
      <span>{fieldName} Field</span>
    </span>
  );
}
