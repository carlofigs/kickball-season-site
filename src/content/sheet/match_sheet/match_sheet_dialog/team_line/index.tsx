import { Link } from 'react-router-dom';
import { useTeamDeepLinkTo } from '../../../../../hooks/use_team_deep_link';
import type { ScheduleData } from '../../../../../types/schedule';
import { darkenColor, teamColor } from '../../../../../utils/schedule';

type Props = {
  teams: ScheduleData['teams'];
  label: string;
  teamShortName: string;
  align: 'left' | 'right';
};

const linkClass =
  'inline-flex max-w-full flex-col gap-1 rounded-lg px-0.5 py-0.5 text-left no-underline outline-none transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400';

export function TeamLine({ teams, label, teamShortName, align }: Props) {
  const teamLink = useTeamDeepLinkTo(teamShortName);
  const team = teams[teamShortName];
  const longName = team != null ? team.name : teamShortName;
  const accent = teamColor(teams, teamShortName);
  const longAccent = darkenColor(accent);

  return (
    <div
      className={`flex min-w-0 flex-col gap-1 ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
    >
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <Link
        to={teamLink}
        className={`${linkClass} ${align === 'right' ? 'items-end text-right' : 'items-start'}`}
      >
        <span
          className="min-w-0 text-lg font-extrabold leading-tight tracking-tight"
          style={{ color: accent }}
        >
          {teamShortName}
        </span>
        <span className="min-w-0 text-xs font-semibold leading-snug" style={{ color: longAccent }}>
          {longName}
        </span>
      </Link>
    </div>
  );
}
