import type { CSSProperties } from 'react';
import type { ScheduleData } from '../../../../../../../../../types/schedule';
import {
  hrefForTeamDeepLink,
  teamColor,
  teamPillLabelColor,
} from '../../../../../../../../../schedule_utils';
import styles from './index.module.css';

type Props = {
  teams: ScheduleData['teams'];
  home: string | null;
  away: string | null;
};

export function MatchupStrip({ teams, home, away }: Props) {
  const homeBg = teamColor(teams, home ?? '');
  const awayBg = teamColor(teams, away ?? '');
  const homeFg = teamPillLabelColor(teams, home ?? '');
  const awayFg = teamPillLabelColor(teams, away ?? '');
  const label = `${home} vs ${away}`;
  const stripStyle = {
    '--matchup-home-bg': homeBg,
    '--matchup-away-bg': awayBg,
    '--matchup-home-fg': homeFg,
    '--matchup-away-fg': awayFg,
  } as CSSProperties;
  const linkClass =
    'relative z-[1] text-xs font-extrabold leading-snug tracking-wide break-words no-underline ' +
    'transition-opacity hover:opacity-90 focus-visible:rounded-sm focus-visible:outline ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60';

  return (
    <div
      className="relative grid min-h-[2.4rem] grid-cols-[1fr_auto_1fr] items-center gap-x-0.5 overflow-hidden rounded-md px-[0.65rem] py-[0.35rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
      style={stripStyle}
      role="group"
      aria-label={label}
    >
      <div className={styles.matchupStripBg} aria-hidden="true" />
      {home != null && home !== '' ? (
        <a
          href={hrefForTeamDeepLink(home)}
          className={`${linkClass} justify-self-start pr-1 text-left`}
          style={{ color: 'var(--matchup-home-fg)' }}
          aria-label={`View schedule for ${home}`}
        >
          {home}
        </a>
      ) : (
        <span
          className="relative z-[1] justify-self-start pr-1 text-left text-xs font-extrabold leading-snug tracking-wide break-words"
          style={{ color: 'var(--matchup-home-fg)' }}
        >
          {home}
        </span>
      )}
      <span
        className="relative z-[2] inline-flex items-center justify-center px-0.5 py-px text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-white [text-shadow:0_0_2px_rgba(0,0,0,0.85),0_1px_4px_rgba(0,0,0,0.55)]"
        aria-hidden="true"
      >
        vs
      </span>
      {away != null && away !== '' ? (
        <a
          href={hrefForTeamDeepLink(away)}
          className={`${linkClass} justify-self-end pl-1 text-right`}
          style={{ color: 'var(--matchup-away-fg)' }}
          aria-label={`View schedule for ${away}`}
        >
          {away}
        </a>
      ) : (
        <span
          className="relative z-[1] justify-self-end pl-1 text-right text-xs font-extrabold leading-snug tracking-wide break-words"
          style={{ color: 'var(--matchup-away-fg)' }}
        >
          {away}
        </span>
      )}
    </div>
  );
}
