import { useCallback, useEffect, useMemo, useState } from 'react';
import scheduleJson from '../data/schedule.json';
import { Footer } from './footer';
import { Header } from './header';
import type { ScheduleData } from './types/schedule';
import { darkenColor, lightenTowardWhite } from './schedule_utils';
import { Content } from './content';
import { TeamSelector } from './team_selector';

const scheduleData = scheduleJson as ScheduleData;

const NEUTRAL_ACCENT = '#6b7280';

export function App() {
  const allTeamNames = useMemo(() => Object.keys(scheduleData.teams), []);

  const [selectedTeam, setSelectedTeam] = useState<string | null>(() =>
    parseTeamFromUrl(allTeamNames)
  );

  const [collapsedByCard, setCollapsedByCard] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const color = selectedTeam != null ? scheduleData.teams[selectedTeam].color : NEUTRAL_ACCENT;
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-light', lightenTowardWhite(color, 0.12));
    document.documentElement.style.setProperty('--accent-dark', darkenColor(color));

    let chromeB: string;
    if (selectedTeam == null) {
      document.documentElement.style.setProperty('--chrome-a', '#ffffff');
      chromeB = '#f8fafc';
      document.documentElement.style.setProperty('--chrome-b', chromeB);
      document.documentElement.style.setProperty('--chrome-c', '#f1f5f9');
      document.documentElement.style.setProperty('--chrome-border', 'rgba(226, 232, 240, 0.95)');
    } else {
      const teamHex = scheduleData.teams[selectedTeam].color;
      document.documentElement.style.setProperty('--chrome-a', lightenTowardWhite(teamHex, 0.04));
      chromeB = lightenTowardWhite(teamHex, 0.06);
      document.documentElement.style.setProperty('--chrome-b', chromeB);
      document.documentElement.style.setProperty('--chrome-c', lightenTowardWhite(teamHex, 0.13));
      document.documentElement.style.setProperty(
        '--chrome-border',
        `color-mix(in srgb, ${teamHex} 24%, rgb(226 232 240))`
      );
    }

    const themeMeta = document.getElementById('theme-color-meta');
    if (themeMeta != null) {
      themeMeta.setAttribute('content', colorForMetaTag(chromeB));
    }
  }, [selectedTeam]);

  const selectTeam = useCallback((team: string | null) => {
    setSelectedTeam(team);
    setTeamInUrl(team);
  }, []);

  const runGameDeepLink = useCallback(() => {
    const gameNum = parseGameNumberFromUrl();
    if (gameNum == null) return;
    const cardElement = findCardElementForGame(gameNum);
    if (cardElement == null) return;
    const gameId = (cardElement as HTMLElement).dataset.gameId;
    if (gameId != null) {
      const body = document.getElementById(`card-body-${gameId}`);
      if (body != null && body.dataset.collapsed === 'true') {
        setCollapsedByCard((previous) => ({ ...previous, [gameId]: false }));
        setTimeout(() => {
          const cardElementAfterExpand = findCardElementForGame(gameNum);
          if (cardElementAfterExpand != null) scrollAndHighlight(cardElementAfterExpand);
        }, 0);
        return;
      }
    }
    scrollAndHighlight(cardElement);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const next = parseTeamFromUrl(allTeamNames);
      setSelectedTeam((previousSelection) =>
        next !== previousSelection ? next : previousSelection
      );
      requestAnimationFrame(() => {
        requestAnimationFrame(runGameDeepLink);
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [allTeamNames, runGameDeepLink]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(runGameDeepLink);
    });
    return () => cancelAnimationFrame(id);
  }, [selectedTeam, runGameDeepLink]);

  useEffect(() => {
    const onHash = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(runGameDeepLink);
      });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [runGameDeepLink]);

  const handleToggleCard = useCallback((cardId: string, defaultCollapsedIfUnset: boolean) => {
    setCollapsedByCard((previous) => {
      const currentCollapsed =
        previous[cardId] !== undefined ? previous[cardId] : defaultCollapsedIfUnset;
      return { ...previous, [cardId]: !currentCollapsed };
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Opaque band for the status-bar safe area so scrolling content does not show
          through `black-translucent` when the header has scrolled away. */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 right-0 z-20"
        style={{
          height: 'env(safe-area-inset-top, 0px)',
          background: 'linear-gradient(165deg, var(--chrome-a) 0%, var(--chrome-b) 100%)',
        }}
      />
      <Header />
      <TeamSelector
        teams={scheduleData.teams}
        selectedTeam={selectedTeam}
        onSelect={(team) => selectTeam(team)}
      />
      <Content
        schedule={scheduleData}
        teams={scheduleData.teams}
        selectedTeam={selectedTeam}
        collapsedByCard={collapsedByCard}
        onToggleCard={handleToggleCard}
      />
      <Footer />
    </div>
  );
}

/** iOS Safari prefers hex in `theme-color`; CSS vars may use `rgb()`. */
function colorForMetaTag(cssColor: string): string {
  const trimmed = cssColor.trim();
  if (trimmed.startsWith('#')) return trimmed;
  const match = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(trimmed);
  if (match == null) return '#f8fafc';
  const toHex = (channel: string) => Number.parseInt(channel, 10).toString(16).padStart(2, '0');
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}

function parseTeamFromUrl(allTeamNames: string[]): string | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('team');
  if (raw == null || raw === '') return null;
  return allTeamNames.includes(raw) ? raw : null;
}

function setTeamInUrl(team: string | null): void {
  const url = new URL(window.location.href);
  if (team == null) {
    url.searchParams.delete('team');
  } else {
    url.searchParams.set('team', team);
  }
  window.history.replaceState({}, '', url.toString());
}

function parseGameNumberFromUrl(): number | null {
  const hash = window.location.hash.replace(/^#/, '');
  const match = /^game-(\d+)$/.exec(hash);
  if (match == null) return null;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : null;
}

function findCardElementForGame(gameNumber: number): HTMLElement | null {
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

function scrollAndHighlight(element: Element): void {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element.classList.add('deep-link-highlight');
  setTimeout(() => element.classList.remove('deep-link-highlight'), 2600);
}
