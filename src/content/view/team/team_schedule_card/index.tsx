import type { Fixture, Game, PitchField, ScheduleData } from '../../../../types/schedule';
import { hexToRgb, teamColor, teamPillLabelColor } from '../../../../schedule_utils';
import { TeamScheduleCardHeader } from './card_header';
import { TeamScheduleCardTheme } from './card_theme';
import { TeamScheduleFieldDuties } from './field_duties';
import { TeamScheduleMatchLine } from './match_line';
import styles from './index.module.css';

type TeamScheduleMatchRow = {
  time: string;
  fixture: Fixture;
  field: PitchField;
};

type Props = {
  game: Game;
  teams: ScheduleData['teams'];
  selectedTeam: string;
};

export function TeamScheduleCard({ game, teams, selectedTeam }: Props) {
  const teamMatch = findTeamMatchForGame(game, selectedTeam);
  if (teamMatch == null) return null;

  const { fixture } = teamMatch;
  const opp = fixture.home === selectedTeam ? fixture.away : fixture.home;
  const oppColor = teamColor(teams, opp);
  const oppLabel = teamPillLabelColor(teams, opp);
  const oppRgb = hexToRgb(oppColor);

  return (
    <div
      className={`${styles.teamScheduleCard} flex min-h-0 flex-col overflow-hidden rounded-[0.875rem] border border-slate-200 border-l-[5px] p-0`}
      data-card-id={String(game.gameNumber)}
      data-game-id={String(game.gameNumber)}
      style={{
        borderLeftColor: oppColor,
        ['--opp-r' as string]: String(oppRgb.r),
        ['--opp-g' as string]: String(oppRgb.g),
        ['--opp-b' as string]: String(oppRgb.b),
      }}
    >
      <div className="shrink-0 px-3.5 pb-3 pt-3.5">
        <TeamScheduleCardHeader
          gameNumber={game.gameNumber}
          date={game.date}
          opponentName={opp}
          opponentColor={oppColor}
          opponentLabelColor={oppLabel}
        />
        <TeamScheduleCardTheme theme={game.theme} themeEmoji={game.themeEmoji} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-0">
        <TeamScheduleMatchLine time={teamMatch.time} field={teamMatch.field} />
        <TeamScheduleFieldDuties
          setupTime={
            game.fieldSetupTeams.includes(selectedTeam) && game.fieldSetupTime
              ? game.fieldSetupTime
              : null
          }
          packTime={
            game.fieldPackDownTeams.includes(selectedTeam) && game.fieldPackDownTime
              ? game.fieldPackDownTime
              : null
          }
        />
      </div>
    </div>
  );
}

function findTeamMatchForGame(game: Game, selectedTeam: string): TeamScheduleMatchRow | null {
  for (const block of game.matches) {
    for (const fixture of block.fixtures) {
      if (fixture.home === selectedTeam || fixture.away === selectedTeam) {
        return {
          time: block.time,
          fixture,
          field: fixture.field,
        };
      }
    }
  }
  return null;
}
