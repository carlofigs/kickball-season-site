import type { ScheduleData } from '../../../types/schedule';
import { buildMergedGameGroups } from './merged_game_groups';
import { AllTeamsGameCard } from './game_card';

type Props = {
  schedule: ScheduleData;
  teams: ScheduleData['teams'];
  collapsedByCard: Record<string, boolean>;
  onToggleCard: (cardId: string, defaultCollapsedIfUnset: boolean) => void;
};

/** Full schedule with all matchups (no team filter). */
export function AllTeamsScheduleView({ schedule, teams, collapsedByCard, onToggleCard }: Props) {
  const groups = buildMergedGameGroups(schedule.games);
  return (
    <>
      {groups.map((group) => (
        <AllTeamsGameCard
          key={group.cardId}
          group={group}
          teams={teams}
          collapsedByCard={collapsedByCard}
          onToggle={onToggleCard}
        />
      ))}
    </>
  );
}
