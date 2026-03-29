export function scrollToTop(): void {
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}

/** iOS WebKit (incl. Chrome iOS): detect for scroll-lock strategy. */
function isIosOrIpadosBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function isTouchOrWheelInsideOpenDialog(event: Event): boolean {
  const dialog = document.querySelector('dialog[open]');
  if (dialog == null) return false;
  const target = event.target;
  if (target == null || !(target instanceof Node)) return false;
  return dialog.contains(target);
}

function preventScrollOutsideOpenDialog(event: Event): void {
  if (isTouchOrWheelInsideOpenDialog(event)) return;
  event.preventDefault();
}

/** Blocks wheel + touch scroll on the document except inside the open dialog (capture, non-passive). */
function attachDocumentScrollBlockExceptDialog(): () => void {
  document.addEventListener('wheel', preventScrollOutsideOpenDialog, { passive: false, capture: true });
  document.addEventListener('touchmove', preventScrollOutsideOpenDialog, { passive: false, capture: true });
  return () => {
    document.removeEventListener('wheel', preventScrollOutsideOpenDialog, { capture: true });
    document.removeEventListener('touchmove', preventScrollOutsideOpenDialog, { capture: true });
  };
}

/**
 * Stops the page behind a modal from scrolling.
 *
 * Desktop: `overflow: hidden` on `body` only (not `html`, so sticky chrome keeps working) plus
 * wheel/touchmove prevention outside the open `<dialog>`.
 *
 * iOS / iPadOS: `overflow: hidden` on `html` and `body` plus wheel/touch listeners. We do **not**
 * use `position: fixed` on `body` here — that pattern requires `scrollTo` on unlock and drifts a
 * few pixels each open/close on WebKit (cumulative “scrolls lower” every time). Touch `preventDefault`
 * handles rubber-banding. Sets `data-ios-scroll-lock` for CSS that pins the team bar when needed.
 */
export function lockBodyScrollBehindModal(): () => void {
  if (isIosOrIpadosBrowser()) {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    const detachListeners = attachDocumentScrollBlockExceptDialog();

    html.setAttribute('data-ios-scroll-lock', '');
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      detachListeners();
      html.removeAttribute('data-ios-scroll-lock');
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }

  const body = document.body;
  const prevBodyOverflow = body.style.overflow;
  const desktopScrollY = Math.round(window.scrollY);

  body.style.overflow = 'hidden';

  const detachListeners = attachDocumentScrollBlockExceptDialog();

  return () => {
    body.style.overflow = prevBodyOverflow;
    detachListeners();
    window.scrollTo(0, desktopScrollY);
  };
}
