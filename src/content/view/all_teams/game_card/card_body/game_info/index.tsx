import { Fragment } from 'react';
import { Package, Wrench } from 'lucide-react';
import type { Game, ScheduleData } from '../../../../../../types/schedule';
import { FieldDutyBadge } from './field_duty_badge';

type Props = {
  teams: ScheduleData['teams'];
  games: Game[];
};

export function GameCardGameInfo({ teams, games }: Props) {
  const themeDescription = games[0].themeDescription;

  return (
    <>
      <p className="text-sm text-slate-600 italic mb-4 leading-relaxed">{themeDescription}</p>
      <div className="flex flex-col gap-3 mb-5">
        {games.map((game) => (
          <Fragment key={game.gameNumber}>
            {game.fieldSetupTime && (
              <FieldDutyBadge
                key={`setup-${game.gameNumber}`}
                teams={teams}
                time={game.fieldSetupTime}
                teamNames={game.fieldSetupTeams}
                Icon={Wrench}
                variant="setup"
              />
            )}
            {game.fieldPackDownTime && (
              <FieldDutyBadge
                key={`pack-${game.gameNumber}`}
                teams={teams}
                time={game.fieldPackDownTime}
                teamNames={game.fieldPackDownTeams}
                Icon={Package}
                variant="pack"
              />
            )}
          </Fragment>
        ))}
      </div>
    </>
  );
}
