import type { ScheduleData } from '../../../types/schedule';
import { TeamScheduleCard } from './team_schedule_card';
import { TeamSummary } from './team_summary';

type Props = {
  schedule: ScheduleData;
  teams: ScheduleData['teams'];
  selectedTeam: string;
};

export function TeamScheduleView({ schedule, teams, selectedTeam }: Props) {
  return (
    <>
      <TeamSummary teams={teams} schedule={schedule} team={selectedTeam} />
      <div className="grid grid-cols-1 gap-4 items-stretch md:grid-cols-2 lg:grid-cols-3">
        {schedule.games.map((game) => (
          <TeamScheduleCard
            key={game.gameNumber}
            game={game}
            teams={teams}
            selectedTeam={selectedTeam}
          />
        ))}
      </div>
    </>
  );
}
