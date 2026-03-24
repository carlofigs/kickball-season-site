import { CalendarDays } from 'lucide-react';

export const PAGE_TITLE = 'Kickball · Sydney Summer 2026 Schedule — Season 17';

export const FONTS_STYLESHEET_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap';

export function Header() {
  return (
    <>
      {/* React 19 hoists <title> and <link> into document.head. */}
      <title>{PAGE_TITLE}</title>
      <link rel="stylesheet" href={FONTS_STYLESHEET_HREF} />
      <header
        className="w-full border-b px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:pb-5 md:pt-[calc(env(safe-area-inset-top)+1.25rem)]"
        style={{
          background:
            'linear-gradient(165deg, var(--chrome-a) 0%, var(--chrome-b) 55%, var(--chrome-c) 100%)',
          borderBottomColor: 'var(--chrome-border)',
        }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-0.5 sm:items-start">
          <div
            className="hidden sm:flex shrink-0 sm:col-start-1 sm:row-start-1 sm:row-span-2 sm:self-center"
            aria-hidden="true"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-sm">
              <CalendarDays className="size-[22px] text-indigo-600" />
            </div>
          </div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:col-start-2 sm:row-start-1">
            Sydney Summer 2026
          </p>
          <h1 className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:col-start-2 sm:row-start-2 md:text-3xl md:gap-x-3.5">
            <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="text-slate-900">Kickball</span>
              <span className="font-bold text-slate-900/38 select-none" aria-hidden="true">
                ·
              </span>
              <span className="font-extrabold text-slate-900">Schedule</span>
            </span>
            <span className="inline-flex shrink-0 items-center rounded-full border border-slate-900/12 bg-white px-[0.65rem] py-[0.28rem] text-[0.625rem] font-bold uppercase tracking-[0.1em] text-slate-900 shadow-sm">
              Season 17
            </span>
          </h1>
        </div>
      </header>
    </>
  );
}
