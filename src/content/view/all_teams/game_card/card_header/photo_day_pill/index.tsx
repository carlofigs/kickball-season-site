type Props = {
  visible: boolean;
};

export function PhotoDayPill({ visible }: Props) {
  if (!visible) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/45 bg-gradient-to-b from-amber-50 to-amber-100 px-3 py-1.5 text-[0.65rem] font-bold leading-snug tracking-wide text-amber-900 shadow-sm"
      title="Photo theme this game"
    >
      <span className="inline-flex text-[0.95rem] leading-none" aria-hidden="true">
        📸
      </span>
      <span className="relative top-px">Photo Day</span>
    </span>
  );
}
