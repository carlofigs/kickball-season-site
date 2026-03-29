export type ShareableScheduleUrlOptions =
  | { mode: 'all-teams' }
  | { mode: 'team'; teamShortName: string };

export function buildShareableScheduleUrl(options: ShareableScheduleUrlOptions): string {
  const url = new URL(window.location.pathname, window.location.origin);
  url.hash = '';
  if (options.mode === 'team') {
    url.searchParams.set('team', options.teamShortName);
  }
  return url.toString();
}

export function teamDeepLinkTo(location: { pathname: string; hash: string }, team: string): string {
  const params = new URLSearchParams();
  params.set('team', team);
  return `${location.pathname}?${params.toString()}${location.hash}`;
}

/** Parses `#game-N` (or `game-N`); returns N or null. */
export function parseGameNumberFromHash(hash: string): number | null {
  const hashContent = hash.replace(/^#/, '');
  const match = /^game-(\d+)$/.exec(hashContent);
  if (match == null) return null;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : null;
}

/** Finds the schedule card element for a game number (exact or composite id match). */
export function findCardElementForGame(gameNumber: number): HTMLElement | null {
  const root = document.getElementById('game-cards');
  if (root == null) return null;
  const key = String(gameNumber);
  const exact = root.querySelector<HTMLElement>(`[data-game-id="${key}"]`);
  if (exact != null) return exact;
  return (
    Array.from(root.querySelectorAll<HTMLElement>('[data-game-id]')).find((candidate) => {
      const id = candidate.dataset.gameId ?? '';
      return id.split('-').includes(key);
    }) ?? null
  );
}

export function scrollAndHighlight(element: Element): void {
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  element.classList.add('deep-link-highlight');
  setTimeout(() => element.classList.remove('deep-link-highlight'), 2600);
}
