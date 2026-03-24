import type { Fixture, ScheduleData } from '../../../../../../../../types/schedule';
import { FieldLabel } from './field_label';
import { MatchupStrip } from './matchup_strip';

type Props = {
  teams: ScheduleData['teams'];
  matchups: Fixture[];
};

export function TimeSlotMatchTable({ teams, matchups }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white [&_thead]:bg-slate-100 [&_tbody_tr]:border-b [&_tbody_tr]:border-slate-100 [&_tbody_tr:last-child]:border-b-0">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="px-3 py-2 text-xs font-semibold text-slate-600 w-20">Field</th>
            <th className="px-3 py-2 text-xs font-semibold text-slate-600">Matchup</th>
          </tr>
        </thead>
        <tbody>
          {matchups.map((fixture) => (
            <tr key={`${fixture.field}-${fixture.home}-${fixture.away}`}>
              <td className="px-3 py-2.5 text-xs font-semibold text-slate-500 align-top">
                <FieldLabel fieldName={fixture.field} />
              </td>
              <td className="px-3 py-2 align-middle">
                <MatchupStrip teams={teams} home={fixture.home} away={fixture.away} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
