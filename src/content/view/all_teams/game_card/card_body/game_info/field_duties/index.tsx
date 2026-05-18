// @ts-nocheck — legacy component, replaced by GLINDA-02/03
import { Flag, Package, Wrench, type LucideIcon } from 'lucide-react';
import type { Game, ScheduleData } from '../../../../../../../types/schedule';
import { FieldDutyRow } from '../../../../../../../shared/field_duty_row';

type Props = {
  teams: ScheduleData['teams'];
  games: Game[];
};

type FieldDutyEntry = {
  key: string;
  variant: 'setup' | 'pack' | 'lineRef';
  time: string;
  teamNames: string[];
};

const FIELD_DUTY_ICONS: Record<FieldDutyEntry['variant'], LucideIcon> = {
  setup: Wrench,
  pack: Package,
  lineRef: Flag,
};

export function GameCardFieldDuties({ teams, games }: Props) {
  const entries = buildFieldDutyEntries(games);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mb-5">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
        Team duties
      </p>
      <div className="divide-y divide-slate-200/80 rounded-lg border border-slate-200/70 bg-white/55">
        {entries.map((entry) => (
          <FieldDutyRow
            key={entry.key}
            teams={teams}
            time={entry.time}
            teamNames={entry.teamNames}
            Icon={FIELD_DUTY_ICONS[entry.variant]}
            variant={entry.variant}
          />
        ))}
      </div>
    </div>
  );
}

function buildFieldDutyEntries(games: Game[]): FieldDutyEntry[] {
  const setupAndPackEntries = games.flatMap((game) => [
    ...(game.fieldSetupTime != null
      ? [
          {
            key: `setup-${game.gameNumber}`,
            variant: 'setup' as const,
            time: game.fieldSetupTime,
            teamNames: game.fieldSetupTeams,
          },
        ]
      : []),
    ...(game.fieldPackDownTime != null
      ? [
          {
            key: `pack-${game.gameNumber}`,
            variant: 'pack' as const,
            time: game.fieldPackDownTime,
            teamNames: game.fieldPackDownTeams,
          },
        ]
      : []),
  ]);

  const lineRefEntries = games.flatMap((game) =>
    game.matches.flatMap((block, blockIndex) =>
      block.fixtures.length > 0
        ? [
            {
              key: `lineref-${game.gameNumber}-${blockIndex}`,
              variant: 'lineRef' as const,
              time: block.time,
              teamNames: [...new Set(block.fixtures.flatMap((fixture) => fixture.lineRefTeams))],
            },
          ]
        : []
    )
  );

  return [...setupAndPackEntries, ...lineRefEntries];
}
