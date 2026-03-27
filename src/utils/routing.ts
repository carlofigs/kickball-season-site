/**
 * Builds a shareable URL from the current location: keeps existing query params (e.g. fbclid),
 * clears `#game-*` hash, and sets or removes `team` only.
 */
export type ShareableScheduleUrlOptions =
  | { mode: 'all-teams' }
  | { mode: 'team'; teamShortName: string };

export function buildShareableScheduleUrl(options: ShareableScheduleUrlOptions): string {
  const url = new URL(window.location.href);
  url.hash = '';
  if (options.mode === 'all-teams') {
    url.searchParams.delete('team');
  } else {
    url.searchParams.set('team', options.teamShortName);
  }
  return url.toString();
}

/** Reads `?team=` from the current URL; returns a valid team name or null. */
export function parseTeamFromUrl(allTeamNames: string[]): string | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('team');
  if (raw == null || raw === '') return null;
  return allTeamNames.includes(raw) ? raw : null;
}

/** Updates `?team=` in the URL without navigation. */
export function setTeamInUrl(team: string | null): void {
  const url = new URL(window.location.href);
  if (team == null) {
    url.searchParams.delete('team');
  } else {
    url.searchParams.set('team', team);
  }
  window.history.replaceState({}, '', url.toString());
}

/** Parses `#game-N` from the hash; returns N or null. */
export function parseGameNumberFromUrl(): number | null {
  const hash = window.location.hash.replace(/^#/, '');
  const match = /^game-(\d+)$/.exec(hash);
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
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element.classList.add('deep-link-highlight');
  setTimeout(() => element.classList.remove('deep-link-highlight'), 2600);
}
