import { formatDate } from '../../../../../schedule_utils';

type Props = {
  gameNumber: number;
  date: string;
  opponentName: string;
  opponentColor: string;
  opponentLabelColor: string;
};

export function TeamScheduleCardHeader({
  gameNumber,
  date,
  opponentName,
  opponentColor,
  opponentLabelColor,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span className="text-base font-extrabold tracking-tight text-slate-900">
          Game {gameNumber}
        </span>
        <span className="text-[0.7rem] font-semibold text-slate-300" aria-hidden="true">
          ·
        </span>
        <span className="text-[0.7rem] font-semibold text-slate-400">{formatDate(date)}</span>
      </div>
      <span
        className="inline-flex shrink-0 items-center rounded-full px-[0.65rem] py-[0.35rem] text-[0.65rem] font-bold tracking-wide shadow-sm"
        style={{ background: opponentColor, color: opponentLabelColor }}
      >
        {opponentName}
      </span>
    </div>
  );
}
