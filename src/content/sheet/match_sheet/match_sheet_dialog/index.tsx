import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Flag, X } from 'lucide-react';
import type { ScheduleData } from '../../../../types/schedule';
import { FieldDutyRow } from '../../../../shared/field_duty_row';
import { PitchFieldPill } from '../../../../shared/pitch_field_pill';
import { lockBodyScrollBehindModal } from '../../../../utils/scroll';
import { formatDate, teamColor } from '../../../../utils/schedule';
import type { MatchSheetPayload } from '../match_sheet_provider';
import { TeamLine } from './team_line';
import styles from './index.module.css';

type Props = {
  teams: ScheduleData['teams'];
  match: MatchSheetPayload | null;
  onClose: () => void;
};

export function MatchSheetDialog({ teams, match, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetInnerRef = useRef<HTMLDivElement>(null);
  const [displayMatch, setDisplayMatch] = useState<MatchSheetPayload | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const sheetIsOpen = displayMatch != null;

  useLayoutEffect(() => {
    if (match != null) {
      setDisplayMatch(match);
      setIsExiting(false);
    }
  }, [match]);

  /* Lock document scroll before paint so `showModal` cannot move the page. */
  useLayoutEffect(() => {
    if (!sheetIsOpen) return;
    return lockBodyScrollBehindModal();
  }, [sheetIsOpen]);

  useEffect(() => {
    if (match == null && displayMatch != null && !isExiting) {
      setIsExiting(true);
    }
  }, [match, displayMatch, isExiting]);

  useLayoutEffect(() => {
    if (displayMatch == null) return;
    const dialog = dialogRef.current;
    if (dialog == null) return;
    if (!dialog.open) dialog.showModal();
    const inner = sheetInnerRef.current;
    if (inner != null) {
      inner.scrollTop = 0;
    }
  }, [displayMatch]);

  useEffect(() => {
    if (displayMatch == null) return;
    const dialog = dialogRef.current;
    if (dialog == null) return;
    function handleClose() {
      setDisplayMatch(null);
      setIsExiting(false);
      onClose();
    }
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [displayMatch, onClose]);

  useEffect(() => {
    if (!isExiting) return;
    const dialogEl = dialogRef.current;
    if (dialogEl == null) return;
    const sheet: HTMLDialogElement = dialogEl;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      sheet.close();
      return;
    }

    function handleAnimationEnd(event: AnimationEvent) {
      if (event.target !== sheet) return;
      sheet.removeEventListener('animationend', handleAnimationEnd);
      sheet.close();
    }
    sheet.addEventListener('animationend', handleAnimationEnd);
    return () => sheet.removeEventListener('animationend', handleAnimationEnd);
  }, [isExiting]);

  function beginExit() {
    if (isExiting || displayMatch == null) return;
    setIsExiting(true);
  }

  if (displayMatch == null) {
    return null;
  }

  const panelStyle = {
    '--sheet-home-bg': teamColor(teams, displayMatch.fixture.home),
    '--sheet-away-bg': teamColor(teams, displayMatch.fixture.away),
  } as CSSProperties;

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${isExiting ? styles.dialogExiting : ''}`}
      aria-labelledby="match-sheet-title"
      onCancel={(event) => {
        event.preventDefault();
        beginExit();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          beginExit();
        }
      }}
    >
      <div ref={sheetInnerRef} className={styles.sheetInner}>
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2
                id="match-sheet-title"
                className="min-w-0 text-lg font-bold leading-tight text-slate-900"
              >
                Game {displayMatch.game.gameNumber}
              </h2>
              <span className="shrink-0 text-sm font-semibold text-slate-500" aria-hidden="true">
                ·
              </span>
              <span className="shrink-0 text-sm tabular-nums text-slate-500">
                {formatDate(displayMatch.game.date)}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={`${styles.closeButton} shrink-0 cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 active:bg-slate-100`}
            aria-label="Close"
            onClick={beginExit}
          >
            <X className="size-5" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div
          className={`w-full border-b border-slate-100/90 px-4 py-5 ${styles.matchupPanel}`}
          style={panelStyle}
        >
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-4">
              <TeamLine
                teams={teams}
                label="Home"
                teamShortName={displayMatch.fixture.home}
                align="left"
              />
              <span
                className="shrink-0 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500"
                aria-hidden
              >
                vs
              </span>
              <TeamLine
                teams={teams}
                label="Away"
                teamShortName={displayMatch.fixture.away}
                align="right"
              />
            </div>
            <p className="m-0 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center leading-tight">
              <span className="text-3xl font-bold tabular-nums text-slate-900">
                {displayMatch.slotTime}
              </span>
              <span className="self-center text-xs font-medium text-slate-500">at</span>
              <PitchFieldPill fieldName={displayMatch.fixture.field} size="large" />
            </p>
          </div>
        </div>

        {displayMatch.fixture.lineRefTeams.length > 0 ? (
          <div className="px-4 py-4">
            <div className="rounded-lg border border-slate-200/70 bg-white/55">
              <FieldDutyRow
                inlineTeamChips
                teams={teams}
                teamNames={displayMatch.fixture.lineRefTeams}
                Icon={Flag}
                variant="lineRef"
              />
            </div>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
