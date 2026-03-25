import { Camera } from 'lucide-react';

type Props = {
  visible: boolean;
};

export function PhotoDayPill({ visible }: Props) {
  if (!visible) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[0.65rem] font-semibold leading-none text-amber-900/90"
      title="Photo theme this game"
    >
      <Camera className="size-3 shrink-0 text-amber-700/90" strokeWidth={2} aria-hidden />
      <span>Photo Day</span>
    </span>
  );
}
