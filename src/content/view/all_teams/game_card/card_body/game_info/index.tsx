import type { Game, ScheduleData } from '../../../../../../types/schedule';
import { GameCardFieldDuties } from './field_duties';

type Props = {
  teams: ScheduleData['teams'];
  games: Game[];
};

export function GameCardGameInfo({ teams, games }: Props) {
  const themeDescription = games[0].themeDescription;

  return (
    <>
      <p className="text-sm text-slate-600 italic mb-4 leading-relaxed">{themeDescription}</p>
      <GameCardFieldDuties teams={teams} games={games} />
    </>
  );
}
