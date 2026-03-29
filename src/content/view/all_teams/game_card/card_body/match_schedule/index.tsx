import type { Game, ScheduleData } from '../../../../../../types/schedule';
import { TimeSlotMatchBlock } from './time_slot_match_block';

type Props = {
  teams: ScheduleData['teams'];
  games: Game[];
};

export function GameCardMatchSchedule({ teams, games }: Props) {
  return (
    <div className="mb-1">
      {games.flatMap((game) =>
        game.matches.map((block) => (
          <TimeSlotMatchBlock
            key={`${game.gameNumber}-${block.time}`}
            teams={teams}
            game={game}
            time={block.time}
            fixtures={block.fixtures}
          />
        ))
      )}
    </div>
  );
}
