import { formatDate, hrefForTeamDeepLink } from '../../../../../utils/schedule';

type Props = {
  gameNumber: number;
  date: string;
  opponentTeam: string;
  opponentTeamName: string;
  opponentColor: string;
  opponentLabelColor: string;
};

export function TeamScheduleCardHeader({
  gameNumber,
  date,
  opponentTeam,
  opponentTeamName,
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
      <a
        href={hrefForTeamDeepLink(opponentTeam)}
        className="inline-flex max-w-[min(100%,20rem)] shrink-0 items-center rounded-full px-[0.65rem] py-[0.35rem] text-[0.65rem] font-bold tracking-wide shadow-sm no-underline transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/55"
        style={{ background: opponentColor, color: opponentLabelColor }}
        aria-label={`View schedule for ${opponentTeam}, ${opponentTeamName}`}
      >
        <span className="min-w-0 text-right leading-tight">
          {opponentTeam}
          <span className="team-schedule-chip-long-name hidden font-semibold opacity-90 md:inline">{` · ${opponentTeamName}`}</span>
        </span>
      </a>
    </div>
  );
}
