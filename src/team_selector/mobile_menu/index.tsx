import { CalendarPlus, MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  addToCalendarDisabled: boolean;
  onAddToCalendar: () => void;
};

export function MobileMenu({ addToCalendarDisabled, onAddToCalendar }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current != null && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        className="flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-lg border bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        style={{ borderColor: 'var(--chrome-border)' }}
        aria-label="More schedule options"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <MoreVertical className="size-5 shrink-0" strokeWidth={2} aria-hidden />
      </button>
      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-[12.5rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          style={{ boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)' }}
        >
          <button
            type="button"
            role="menuitem"
            disabled={addToCalendarDisabled}
            aria-disabled={addToCalendarDisabled}
            className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium ${
              addToCalendarDisabled
                ? 'cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => {
              if (addToCalendarDisabled) return;
              onAddToCalendar();
              setIsOpen(false);
            }}
          >
            <CalendarPlus
              className={`size-4 shrink-0 ${addToCalendarDisabled ? 'text-slate-300' : 'text-slate-500'}`}
              strokeWidth={2}
              aria-hidden
            />
            Add to calendar
          </button>
        </div>
      ) : null}
    </div>
  );
}
