import type { ScheduleData } from '../types/schedule';
import { AllTeamsScheduleView } from './view/all_teams';
import { TeamScheduleView } from './view/team';

type Props = {
  schedule: ScheduleData;
  teams: ScheduleData['teams'];
  selectedTeam: string | null;
  collapsedByCard: Record<string, boolean>;
  onToggleCard: (cardId: string, defaultCollapsedIfUnset: boolean) => void;
};

export function Content({ schedule, teams, selectedTeam, collapsedByCard, onToggleCard }: Props) {
  const showTeamView = selectedTeam != null;

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-4 pb-8" id="game-cards">
      {showTeamView ? (
        <TeamScheduleView schedule={schedule} teams={teams} selectedTeam={selectedTeam} />
      ) : (
        <AllTeamsScheduleView
          schedule={schedule}
          teams={teams}
          collapsedByCard={collapsedByCard}
          onToggleCard={onToggleCard}
        />
      )}
    </main>
  );
}
