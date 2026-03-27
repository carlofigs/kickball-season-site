import { useEffect, useState } from 'react';

type Props = {
  message: string | null;
};

const EXIT_MS = 320;

/** Fixed, non-interactive status toast; parent controls message; exit animates before unmount. */
export function ToastBanner({ message }: Props) {
  const [visibleText, setVisibleText] = useState<string | null>(null);
  const [enterReady, setEnterReady] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (message != null) {
      setVisibleText(message);
      setExiting(false);
      setEnterReady(false);
    }
  }, [message]);

  useEffect(() => {
    if (message == null && visibleText != null) {
      setExiting(true);
    }
  }, [message, visibleText]);

  useEffect(() => {
    if (visibleText == null || exiting) return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEnterReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [visibleText, exiting]);

  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(() => {
      setVisibleText(null);
      setExiting(false);
      setEnterReady(false);
    }, EXIT_MS);
    return () => window.clearTimeout(id);
  }, [exiting]);

  if (visibleText == null) return null;

  const showContent = !exiting && enterReady;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        'pointer-events-none fixed z-[100] w-max max-w-[calc(100vw-2rem)] whitespace-nowrap rounded-xl border ' +
        'px-4 py-2.5 text-center text-sm font-medium text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)]'
      }
      style={{
        left: '50%',
        bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        transform: `translate(-50%, ${showContent ? 0 : 8}px)`,
        opacity: showContent ? 1 : 0,
        transition: `opacity ${EXIT_MS}ms ease-out, transform ${EXIT_MS}ms ease-out`,
        background:
          'linear-gradient(165deg, color-mix(in srgb, var(--accent-dark) 82%, black) 0%, var(--accent-dark) 100%)',
        borderColor: 'color-mix(in srgb, var(--accent) 42%, rgba(255,255,255,0.12))',
      }}
    >
      {visibleText}
    </div>
  );
}
