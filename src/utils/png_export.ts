import { toBlob } from 'html-to-image';
import { slugForTeamFilename } from './schedule';

const CAPTURE_CLASS = 'team-schedule-export-capture';

export type TeamPngShareLabels = {
  title: string;
  text: string;
};

/**
 * Mobile Safari often ignores `<a download>` for programmatic clicks; object URLs help, but the
 * Web Share sheet with a PNG file is the reliable path on touch devices. Desktop keeps a normal
 * download (no share-first).
 */
async function savePngBlob(
  blob: Blob,
  filename: string,
  shareLabels: TeamPngShareLabels
): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' });
  const touchDevice = (navigator.maxTouchPoints ?? 0) > 0;
  const canShareFile =
    touchDevice &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] });

  if (canShareFile) {
    try {
      await navigator.share({
        files: [file],
        title: shareLabels.title,
        text: shareLabels.text,
      });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (error instanceof Error && error.name === 'AbortError') return;
      console.warn('navigator.share failed, trying download', error);
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = url;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Renders the team schedule at a wide layout (3 columns) via CSS, then downloads or shares a PNG.
 */
export async function exportTeamSchedulePng(
  element: HTMLElement,
  teamShortName: string,
  shareLabels: TeamPngShareLabels
): Promise<void> {
  element.classList.add(CAPTURE_CLASS);
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
  try {
    const blob = await toBlob(element, {
      backgroundColor: '#f8fafc',
      cacheBust: true,
    });
    if (blob == null) {
      throw new Error('Snapshot export failed (empty image).');
    }
    await savePngBlob(
      blob,
      `kickball-${slugForTeamFilename(teamShortName)}-schedule.png`,
      shareLabels
    );
  } finally {
    element.classList.remove(CAPTURE_CLASS);
  }
}
