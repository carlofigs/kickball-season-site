import type { Game, ScheduleData } from '../../../../../types/schedule';
import { GameCardGameInfo } from './game_info';
import { GameCardMatchSchedule } from './match_schedule';
import { GameCardPostPlay } from './post_play';

type Props = {
  teams: ScheduleData['teams'];
  games: Game[];
};

export function GameCardBody({ teams, games }: Props) {
  const postPlaySocial = games[0].postPlaySocial;

  return (
    <div className="px-4 pt-3 pb-4">
      <GameCardGameInfo teams={teams} games={games} />
      <GameCardMatchSchedule teams={teams} games={games} />
      <GameCardPostPlay postPlaySocial={postPlaySocial} />
    </div>
  );
}
