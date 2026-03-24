import type { ScheduleData } from '../../../../types/schedule';
import type { MergedGameGroup } from '../merged_game_groups';
import { GameCardBody } from './card_body';
import { GameCardHeader } from './card_header';
import styles from './index.module.css';

type Props = {
  group: MergedGameGroup;
  teams: ScheduleData['teams'];
  collapsedByCard: Record<string, boolean>;
  onToggle: (cardId: string, defaultCollapsedIfUnset: boolean) => void;
};

export function AllTeamsGameCard({ group, teams, collapsedByCard, onToggle }: Props) {
  const { gamesToRender, cardId, cardTitle, cardSubtitle } = group;

  const gameDate = new Date(`${gamesToRender[0].date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastGame = gameDate < today;
  const isCollapsed = collapsedByCard[cardId] !== undefined ? collapsedByCard[cardId] : isPastGame;
  const showPhotoDay = gamesToRender.some((game) => game.gameNumber === 1);

  return (
    <article
      className="mb-4 overflow-hidden rounded-xl border border-slate-200/90 border-l-4 border-l-gray-400 bg-white shadow-md"
      data-game-id={cardId}
    >
      <GameCardHeader
        cardTitle={cardTitle}
        cardSubtitle={cardSubtitle}
        games={gamesToRender}
        showPhotoDay={showPhotoDay}
        isCollapsed={isCollapsed}
        isPastGame={isPastGame}
        cardId={cardId}
        onToggle={onToggle}
      />
      <div
        className={`${styles.cardBody} ${isCollapsed ? styles.cardBodyCollapsed : ''}`}
        id={`card-body-${cardId}`}
        data-collapsed={isCollapsed ? 'true' : 'false'}
      >
        <GameCardBody teams={teams} games={gamesToRender} />
      </div>
    </article>
  );
}
