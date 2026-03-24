import { Clock } from 'lucide-react';
import type { Fixture, ScheduleData } from '../../../../../../../types/schedule';
import { TimeSlotMatchTable } from './time_slot_match_table';

type Props = {
  teams: ScheduleData['teams'];
  time: string;
  fixtures: Fixture[];
};

export function TimeSlotMatchBlock({ teams, time, fixtures }: Props) {
  if (fixtures.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
        <Clock className="size-3 shrink-0" aria-hidden />
        {time}
      </div>
      <TimeSlotMatchTable teams={teams} matchups={fixtures} />
    </div>
  );
}
