import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { scrollToTop } from '../utils/scroll';
import {
  findCardElementForGame,
  parseGameNumberFromHash,
  scrollAndHighlight,
} from '../utils/routing';

type UseScheduleRoutingResult = {
  selectedTeam: string | null;
  selectTeam: (team: string | null) => void;
};

export function useScheduleRouting(
  allTeamNames: string[],
  setCollapsedByCard: Dispatch<SetStateAction<Record<string, boolean>>>
): UseScheduleRoutingResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTeam = teamFromSearchParams(searchParams, allTeamNames);
  const location = useLocation();

  const runGameDeepLinkRef = useRef<() => void>(() => {});
  const previousTeamRef = useRef<string | null | undefined>(undefined);

  runGameDeepLinkRef.current = () => {
    const gameNum = parseGameNumberFromHash(location.hash);
    if (gameNum == null) return;
    const cardElement = findCardElementForGame(gameNum);
    if (cardElement == null) return;
    const { gameId } = cardElement.dataset;
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
    setSearchParams(
      (previous) => {
        const next = nextSearchParamsForTeam(previous, team);
        if (next.toString() === previous.toString()) {
          return previous;
        }
        return next;
      },
      { replace: false }
    );
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => runGameDeepLinkRef.current());
    });
    return () => cancelAnimationFrame(id);
  }, [selectedTeam, location.pathname, location.search, location.hash]);

  useEffect(() => {
    const previous = previousTeamRef.current;

    const shouldScrollToTopHome =
      previous !== undefined && previous != null && selectedTeam == null;
    if (shouldScrollToTopHome) {
      const timeoutId = window.setTimeout(() => {
        scrollToTop();
      }, 0);
      previousTeamRef.current = selectedTeam;
      return () => window.clearTimeout(timeoutId);
    }

    const shouldScrollToTopTeam =
      previous !== undefined &&
      previous === null &&
      selectedTeam != null;
    if (shouldScrollToTopTeam) {
      const timeoutId = window.setTimeout(() => {
        scrollToTop();
      }, 0);
      previousTeamRef.current = selectedTeam;
      return () => window.clearTimeout(timeoutId);
    }

    previousTeamRef.current = selectedTeam;
  }, [selectedTeam]);

  return { selectedTeam, selectTeam };
}

function nextSearchParamsForTeam(previous: URLSearchParams, team: string | null): URLSearchParams {
  const next = new URLSearchParams(previous);
  if (team == null) {
    next.delete('team');
  } else {
    next.set('team', team);
  }
  return next;
}

function teamFromSearchParams(
  searchParams: URLSearchParams,
  allTeamNames: string[]
): string | null {
  const raw = searchParams.get('team');
  if (raw == null || raw === '') {
    return null;
  }
  return allTeamNames.includes(raw) ? raw : null;
}
