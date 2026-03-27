import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Game } from '../../../../../types/schedule';
import { formatDate } from '../../../../../utils/schedule';
import { PhotoDayPill } from './photo_day_pill';

type Props = {
  cardTitle: string;
  cardSubtitle: string;
  games: Game[];
  showPhotoDay: boolean;
  isCollapsed: boolean;
  isPastGame: boolean;
  cardId: string;
  onToggle: (cardId: string, defaultCollapsedIfUnset: boolean) => void;
};

export function GameCardHeader({
  cardTitle,
  cardSubtitle,
  games,
  showPhotoDay,
  isCollapsed,
  isPastGame,
  cardId,
  onToggle,
}: Props) {
  const firstGame = games[0];

  return (
    <div
      className="cursor-pointer border-b border-slate-100 px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/90 select-none [&_*]:cursor-[inherit]"
      onClick={() => onToggle(cardId, isPastGame)}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault();
          onToggle(cardId, isPastGame);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={!isCollapsed}
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{cardTitle}</span>
          <PhotoDayPill visible={showPhotoDay} />
        </h2>
        {cardSubtitle ? <p className="text-xs text-slate-400 font-medium">{cardSubtitle}</p> : null}
        <p className="text-sm text-slate-500 mt-1">
          {formatDate(firstGame.date)} ·{' '}
          <span className="font-semibold text-[color:var(--accent)]">{firstGame.theme}</span>
        </p>
      </div>
      {isCollapsed ? (
        <ChevronDown className="size-5 shrink-0 text-slate-400" />
      ) : (
        <ChevronUp className="size-5 shrink-0 text-slate-400" />
      )}
    </div>
  );
}
