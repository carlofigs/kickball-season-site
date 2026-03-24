import type { LucideIcon } from 'lucide-react';

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
  Icon: LucideIcon;
  variant: DutyVariant;
  time: string;
};

export function TeamScheduleFieldDutyBadge({ Icon, variant, time }: Props) {
  return (
    <span
      className={`box-border inline-flex min-h-7 items-center gap-[0.35rem] rounded-lg border border-transparent px-[0.65rem] py-[0.3125rem] text-[0.6875rem] font-bold leading-none ${VARIANT_CLASS[variant]} [&_svg]:block [&_svg]:size-3 [&_svg]:shrink-0`}
    >
      <Icon aria-hidden />
      {VARIANT_LABEL[variant]} {time}
    </span>
  );
}
