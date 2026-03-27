import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  findCardElementForGame,
  parseGameNumberFromUrl,
  parseTeamFromUrl,
  scrollAndHighlight,
  setTeamInUrl,
} from '../utils/routing';

/**
 * Keeps `selectedTeam` in sync with `?team=`, runs `#game-N` deep links after navigation
 * or when cards expand. Pass a stable `allTeamNames` array (e.g. module-level keys).
 */
type ScheduleRoutingData = {
  selectedTeam: string | null;
};

type ScheduleRoutingActions = {
  selectTeam: (team: string | null) => void;
};

export function useScheduleRouting(
  allTeamNames: string[],
  setCollapsedByCard: Dispatch<SetStateAction<Record<string, boolean>>>
): [ScheduleRoutingData, ScheduleRoutingActions] {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(() =>
    parseTeamFromUrl(allTeamNames)
  );

  const runGameDeepLinkRef = useRef<() => void>(() => {});

  runGameDeepLinkRef.current = () => {
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
  };

  function selectTeam(team: string | null) {
    setSelectedTeam(team);
    setTeamInUrl(team);
  }

  useEffect(() => {
    const onPopState = () => {
      const next = parseTeamFromUrl(allTeamNames);
      setSelectedTeam((previousSelection) =>
        next !== previousSelection ? next : previousSelection
      );
      requestAnimationFrame(() => {
        requestAnimationFrame(() => runGameDeepLinkRef.current());
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [allTeamNames]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => runGameDeepLinkRef.current());
    });
    return () => cancelAnimationFrame(id);
  }, [selectedTeam]);

  useEffect(() => {
    const onHash = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => runGameDeepLinkRef.current());
      });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const data: ScheduleRoutingData = { selectedTeam };
  const actions: ScheduleRoutingActions = { selectTeam };
  return [data, actions];
}
