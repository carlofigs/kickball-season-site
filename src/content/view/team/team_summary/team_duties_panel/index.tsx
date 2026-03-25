import { Flag, Package, Wrench } from 'lucide-react';
import { DutyRow } from '../duty_row';

type Props = {
  setupGames: number[];
  packdownGames: number[];
  lineRefGames: number[];
};

export function TeamDutiesPanel({ setupGames, packdownGames, lineRefGames }: Props) {
  return (
    <div className="mt-3 divide-y divide-slate-200/80 rounded-lg border border-slate-200/70 bg-white/55">
      <DutyRow title="Field Setup" Icon={Wrench} accent="emerald" gameNumbers={setupGames} />
      <DutyRow title="Pack Down" Icon={Package} accent="amber" gameNumbers={packdownGames} />
      <DutyRow title="Line Ref" Icon={Flag} accent="indigo" gameNumbers={lineRefGames} />
    </div>
  );
}
