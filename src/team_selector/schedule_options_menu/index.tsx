import { CalendarPlus, ClipboardCopy, ImageDown, MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ScheduleMenuRow } from './schedule_menu_row';

type Props = {
  onAddToCalendar?: () => void;
  copyShareableUrlLabel: string;
  onCopyShareableUrl: () => Promise<void>;
  /** In team schedule view — show Export as PNG. */
  showExportPng?: boolean;
  onExportPng: () => Promise<void>;
  exportPngPending: boolean;
};

export function ScheduleOptionsMenu({
  onAddToCalendar,
  copyShareableUrlLabel,
  onCopyShareableUrl,
  showExportPng = false,
  onExportPng,
  exportPngPending,
}: Props) {
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
        className="flex min-h-[2.75rem] min-w-[2.75rem] cursor-pointer items-center justify-center rounded-lg border bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          className="absolute right-0 top-full z-50 mt-1 w-[min(19rem,calc(100vw-1rem))] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          style={{ boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)' }}
        >
          {onAddToCalendar != null ? (
            <ScheduleMenuRow
              icon={<CalendarPlus strokeWidth={2} />}
              onClick={() => {
                onAddToCalendar();
                setIsOpen(false);
              }}
            >
              Add to calendar
            </ScheduleMenuRow>
          ) : null}
          <ScheduleMenuRow
            icon={<ClipboardCopy strokeWidth={2} />}
            onClick={() => {
              void onCopyShareableUrl().then(() => setIsOpen(false));
            }}
          >
            {copyShareableUrlLabel}
          </ScheduleMenuRow>
          {showExportPng ? (
            <>
              <div className="my-1 border-t border-slate-100" role="separator" />
              <ScheduleMenuRow
                icon={<ImageDown strokeWidth={2} />}
                disabled={exportPngPending}
                disabledCursor="wait"
                onClick={() => {
                  if (exportPngPending) return;
                  void onExportPng().then(() => setIsOpen(false));
                }}
              >
                {exportPngPending ? 'Exporting…' : 'Export as PNG'}
              </ScheduleMenuRow>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
