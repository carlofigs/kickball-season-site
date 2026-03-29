import type { CSSProperties } from 'react';
import type { ScheduleData } from '../../../../../../../../../types/schedule';
import { teamColor, teamPillLabelColor } from '../../../../../../../../../utils/schedule';
import styles from './index.module.css';

type Props = {
  teams: ScheduleData['teams'];
  home: string | null;
  away: string | null;
  onOpen: () => void;
};

const labelClass = 'relative z-[1] text-xs font-extrabold leading-snug tracking-wide break-words';

export function MatchupStrip({ teams, home, away, onOpen }: Props) {
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
  const buttonClass =
    'relative grid min-h-[2.4rem] w-full cursor-pointer grid-cols-[1fr_auto_1fr] items-center gap-x-0.5 overflow-hidden rounded-md border-0 px-[0.65rem] py-[0.35rem] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ' +
    'transition-[transform,opacity] duration-200 ease-out hover:opacity-95 active:scale-[0.99] ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70';

  return (
    <button
      type="button"
      className={buttonClass}
      style={stripStyle}
      aria-label={`${label}. View match details`}
      onClick={onOpen}
    >
      <div className={styles.matchupStripBg} aria-hidden="true" />
      <span
        className={`${labelClass} justify-self-start pr-1 text-left`}
        style={{ color: 'var(--matchup-home-fg)' }}
      >
        {home}
      </span>
      <span
        className="relative z-[2] inline-flex items-center justify-center px-0.5 py-px text-[0.58rem] font-extrabold uppercase tracking-[0.14em] text-white [text-shadow:0_0_2px_rgba(0,0,0,0.85),0_1px_4px_rgba(0,0,0,0.55)]"
        aria-hidden="true"
      >
        vs
      </span>
      <span
        className={`${labelClass} justify-self-end pl-1 text-right`}
        style={{ color: 'var(--matchup-away-fg)' }}
      >
        {away}
      </span>
    </button>
  );
}
