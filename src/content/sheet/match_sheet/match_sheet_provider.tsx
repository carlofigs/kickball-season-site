import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Fixture, Game, ScheduleData } from '../../../types/schedule';
import { MatchSheetDialog } from './match_sheet_dialog';

/** One fixture within a game time slot, for the match detail sheet. */
export type MatchSheetPayload = {
  game: Game;
  slotTime: string;
  fixture: Fixture;
};

type UseMatchSheetResult = {
  openMatchSheet: (payload: MatchSheetPayload) => void;
  closeMatchSheet: () => void;
};

const MatchSheetContext = createContext<UseMatchSheetResult | null>(null);

type ProviderProps = {
  children: ReactNode;
  teams: ScheduleData['teams'];
  /** When set, the sheet closes (switching to team schedule view). */
  selectedTeam: string | null;
};

export function MatchSheetProvider({ children, teams, selectedTeam }: ProviderProps) {
  const [match, setMatch] = useState<MatchSheetPayload | null>(null);

  useEffect(() => {
    if (selectedTeam != null) setMatch(null);
  }, [selectedTeam]);

  return (
    <MatchSheetContext.Provider
      value={{
        openMatchSheet: (payload) => setMatch(payload),
        closeMatchSheet: () => setMatch(null),
      }}
    >
      {children}
      <MatchSheetDialog teams={teams} match={match} onClose={() => setMatch(null)} />
    </MatchSheetContext.Provider>
  );
}

export function useMatchSheet(): UseMatchSheetResult {
  const context = useContext(MatchSheetContext);
  if (context == null) {
    throw new Error('useMatchSheet must be used within MatchSheetProvider');
  }
  return context;
}
