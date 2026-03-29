import type { MouseEvent } from 'react';
import type { Fixture, Game, PitchField, ScheduleData } from '../../../../types/schedule';
import { useMatchSheet } from '../../../sheet/match_sheet/match_sheet_provider';
import { hexToRgb, teamColor, teamPillLabelColor } from '../../../../utils/schedule';
import { TeamScheduleCardHeader } from './card_header';
import { TeamScheduleCardTheme } from './card_theme';
import { TeamScheduleFieldDuties, type LineRefDutySlot } from './field_duties';
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
  const { openMatchSheet } = useMatchSheet();
  const teamMatch = findTeamMatchForGame(game, selectedTeam);
  if (teamMatch == null) return null;

  const lineRefSlot = findLineRefDutySlotForGame(game, selectedTeam);

  const { fixture, time: matchSlotTime } = teamMatch;
  const opponent = fixture.home === selectedTeam ? fixture.away : fixture.home;
  const oppColor = teamColor(teams, opponent);
  const oppLabel = teamPillLabelColor(teams, opponent);

  const oppRgb = hexToRgb(oppColor);

  function openSheetFromCard(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('a')) return;
    openMatchSheet({ game, slotTime: matchSlotTime, fixture });
  }

  return (
    <div
      className={`${styles.teamScheduleCard} flex min-h-0 w-full cursor-pointer flex-col overflow-hidden rounded-[0.875rem] border border-slate-200 border-l-[5px] p-0 active:scale-[0.995]`}
      data-card-id={String(game.gameNumber)}
      data-game-id={String(game.gameNumber)}
      onClick={openSheetFromCard}
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
          opponentTeam={opponent}
          opponentTeamName={teams[opponent].name}
          opponentColor={oppColor}
          opponentLabelColor={oppLabel}
        />
        <TeamScheduleCardTheme
          theme={game.theme}
          themeEmoji={game.themeEmoji}
          themeDescription={game.themeDescription}
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-0">
        <div className="min-h-0 min-w-0 flex-1 shrink" aria-hidden />
        <div className="shrink-0">
          <TeamScheduleMatchLine time={matchSlotTime} field={fixture.field} />
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
            lineRefSlot={lineRefSlot}
          />
        </div>
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

function findLineRefDutySlotForGame(game: Game, selectedTeam: string): LineRefDutySlot | null {
  for (const block of game.matches) {
    for (const fixture of block.fixtures) {
      if (fixture.lineRefTeams.includes(selectedTeam)) {
        return { time: block.time, field: fixture.field };
      }
    }
  }
  return null;
}
