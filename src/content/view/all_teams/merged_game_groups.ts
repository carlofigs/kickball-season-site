import type { Game } from '../../../types/schedule';

export type MergedGameGroup = {
  gamesToRender: Game[];
  cardId: string;
  cardTitle: string;
  cardSubtitle: string;
};

export function buildMergedGameGroups(games: Game[]): MergedGameGroup[] {
  const { groups } = games.reduce<{
    merged: Set<number>;
    groups: MergedGameGroup[];
  }>(
    (state, game, gameIndex) => {
      if (state.merged.has(game.gameNumber)) return state;
      const nextGame = gameIndex + 1 < games.length ? games[gameIndex + 1] : null;
      const isDoubleHeader = nextGame != null && nextGame.date === game.date;

      if (isDoubleHeader && nextGame != null) {
        state.merged.add(nextGame.gameNumber);
        state.groups.push({
          gamesToRender: [game, nextGame],
          cardId: `${game.gameNumber}-${nextGame.gameNumber}`,
          cardTitle: `Game ${game.gameNumber} & ${nextGame.gameNumber}`,
          cardSubtitle: 'Double Header',
        });
      } else {
        state.groups.push({
          gamesToRender: [game],
          cardId: String(game.gameNumber),
          cardTitle: game.title,
          cardSubtitle: '',
        });
      }
      return state;
    },
    { merged: new Set<number>(), groups: [] }
  );
  return groups;
}
