import { ImageDown, Loader2 } from 'lucide-react';

export type LoadingOverlayProps = {
  teamName: string;
  teamEmoji: string;
};

export function LoadingOverlay({ teamName, teamEmoji }: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex min-h-[100dvh] w-full flex-col items-center justify-center bg-slate-50 p-6 pointer-events-auto"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-slate-200/90 bg-white/95 px-7 py-8 text-center shadow-[0_25px_50px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_12%,white)]">
          <ImageDown
            className="size-7 text-[color:var(--accent)] opacity-90"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
        <div className="mb-3 flex items-center justify-center gap-2 text-slate-800">
          <Loader2
            className="size-5 shrink-0 animate-spin text-[color:var(--accent)]"
            aria-hidden
          />
          <h2 className="text-base font-semibold tracking-tight">Hang tight</h2>
        </div>
        <p className="mb-4 text-lg font-medium leading-snug text-slate-800">
          {teamEmoji !== '' ? (
            <span className="mr-1.5 inline-block" aria-hidden>
              {teamEmoji}
            </span>
          ) : null}
          {teamName}
        </p>
        <p className="text-pretty text-sm leading-relaxed text-slate-600">
          We&apos;re generating your team&apos;s schedule so that you can share it with your
          teammates! Hold up!
        </p>
      </div>
    </div>
  );
}
