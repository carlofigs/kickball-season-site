import type { Game, ScheduleData } from '../types/schedule';
import { formatDate, slugForTeamFilename } from './schedule';

const MATCH_DURATION_MINUTES = 90;
const DUTY_BLOCK_MINUTES = 60;

/**
 * Rushcutters Bay Park, NSW — approximate centre (WGS-84), for ICS GEO.
 * @see https://geohack.toolforge.org/geohack.php?pagename=Rushcutters_Bay&params=33.8774_S_151.2282_E
 */
const RUSHCUTTERS_BAY_PARK_GEO = '-33.8774;151.2282';

/** En dash (U+2013), same as in calendar titles. */
const ND = '\u2013';

type CalendarEvent = {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
  /** Deep link: ?team=… & #game-{n} */
  url: string;
};

export function downloadTeamScheduleIcs(schedule: ScheduleData, team: string): void {
  const events = collectTeamCalendarEvents(schedule, team);
  if (events.length === 0) {
    window.alert('No kickball events found for this team.');
    return;
  }
  const ics = buildIcsCalendar(schedule, team, events);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `kickball-${slugForTeamFilename(team)}-schedule.ics`;
  anchor.rel = 'noopener';
  anchor.click();
  URL.revokeObjectURL(url);
}

function collectTeamCalendarEvents(schedule: ScheduleData, team: string): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  const teamDef = schedule.teams[team];
  const teamLongName = teamDef != null ? teamDef.name : team;

  for (const game of schedule.games) {
    const event = buildSingleGameEventForTeam(game, team, teamLongName);
    if (event != null) out.push(event);
  }

  out.sort((eventA, eventB) => eventA.start.getTime() - eventB.start.getTime());
  return out;
}

/**
 * One VEVENT per game where the team plays (home/away). Spans earliest duty/match/line-ref
 * through latest; field duties and line ref are only in DESCRIPTION, not separate events.
 */
function buildSingleGameEventForTeam(
  game: Game,
  team: string,
  teamLongName: string
): CalendarEvent | null {
  const opponent = findOpponentForTeamInGame(game, team);
  if (opponent == null) return null;

  const startTimes: Date[] = [];
  const endTimes: Date[] = [];
  const detailLines: string[] = [];

  if (
    game.fieldSetupTeams.includes(team) &&
    game.fieldSetupTime != null &&
    game.fieldSetupTime !== ''
  ) {
    const start = parseLocalDateTime(game.date, game.fieldSetupTime);
    if (start != null) {
      const end = addMinutes(start, DUTY_BLOCK_MINUTES);
      startTimes.push(start);
      endTimes.push(end);
      detailLines.push(`Field setup: ${game.fieldSetupTime}`);
    }
  }

  if (
    game.fieldPackDownTeams.includes(team) &&
    game.fieldPackDownTime != null &&
    game.fieldPackDownTime !== ''
  ) {
    const start = parseLocalDateTime(game.date, game.fieldPackDownTime);
    if (start != null) {
      const end = addMinutes(start, DUTY_BLOCK_MINUTES);
      startTimes.push(start);
      endTimes.push(end);
      detailLines.push(`Field pack down: ${game.fieldPackDownTime}`);
    }
  }

  for (const block of game.matches) {
    for (const fixture of block.fixtures) {
      const start = parseLocalDateTime(game.date, block.time);
      if (start == null) continue;
      const end = addMinutes(start, MATCH_DURATION_MINUTES);
      const fieldLabel = `${fixture.field} Field`;

      if (fixture.home === team || fixture.away === team) {
        const opponent = fixture.home === team ? fixture.away : fixture.home;
        startTimes.push(start);
        endTimes.push(end);
        detailLines.push(`Match vs ${opponent} @ ${fieldLabel} (${block.time})`);
      } else if (fixture.lineRefTeams.includes(team)) {
        startTimes.push(start);
        endTimes.push(end);
        detailLines.push(
          `Line ref: ${fixture.home} vs ${fixture.away} @ ${fieldLabel} (${block.time})`
        );
      }
    }
  }

  if (startTimes.length === 0) return null;

  const start = new Date(Math.min(...startTimes.map((d) => d.getTime())));
  const end = new Date(Math.max(...endTimes.map((d) => d.getTime())));

  const baseContext = buildGameContextDescription(game, teamLongName);
  const url = buildGameDeepLinkUrl(team, game.gameNumber);
  const description = [
    baseContext,
    '',
    'Your schedule for this game:',
    ...detailLines,
    '',
    `Open schedule: ${url}`,
  ].join('\n');

  const summary = `🏐 Kickball ${ND} ${team} vs ${opponent} ${ND} Game ${game.gameNumber}`;

  return {
    uid: stableUid(`game-${game.gameNumber}-${team}`),
    start,
    end,
    summary,
    description,
    location: 'Rushcutters Bay Park, Sydney',
    url,
  };
}

function buildGameDeepLinkUrl(team: string, gameNumber: number): string {
  if (typeof window === 'undefined') {
    return '';
  }
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set('team', team);
  url.hash = `game-${gameNumber}`;
  return url.toString();
}

function findOpponentForTeamInGame(game: Game, team: string): string | null {
  for (const block of game.matches) {
    for (const fixture of block.fixtures) {
      if (fixture.home === team) return fixture.away;
      if (fixture.away === team) return fixture.home;
    }
  }
  return null;
}

function buildGameContextDescription(game: Game, teamLongName: string): string {
  const lines: string[] = [
    `${game.themeEmoji} ${game.theme}`,
    game.themeDescription.trim(),
    `Date: ${formatDate(game.date)}`,
    `Team: ${teamLongName}`,
  ];
  if (game.postPlaySocial.trim() !== '') {
    lines.push(`Post-play social: ${game.postPlaySocial.trim()}`);
  }
  return lines.join('\n');
}

function parseLocalDateTime(isoDate: string, time12h: string): Date | null {
  const timeParts = parseTime12h(time12h);
  if (timeParts == null) return null;
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (dateParts == null) return null;
  const year = Number(dateParts[1]);
  const month = Number(dateParts[2]);
  const day = Number(dateParts[3]);
  return new Date(year, month - 1, day, timeParts.hours, timeParts.minutes, 0, 0);
}

function parseTime12h(time12h: string): { hours: number; minutes: number } | null {
  const trimmed = time12h.trim();
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
  if (match == null) return null;
  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function stableUid(key: string): string {
  const safe = key.replace(/[^a-zA-Z0-9-]/g, '-');
  return `${safe}@kickball-schedule.local`;
}

function buildIcsCalendar(schedule: ScheduleData, team: string, events: CalendarEvent[]): string {
  const teamDef = schedule.teams[team];
  const calName = teamDef != null ? `${teamDef.emoji} ${team} — Kickball` : `${team} — Kickball`;
  const dtStamp = formatIcsUtc(new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kickball Schedule//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeIcsText(calName)}`,
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART:${formatIcsLocal(event.start)}`);
    lines.push(`DTEND:${formatIcsLocal(event.end)}`);
    lines.push(`SUMMARY:${escapeIcsText(event.summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    lines.push(`GEO:${RUSHCUTTERS_BAY_PARK_GEO}`);
    if (event.url !== '') {
      lines.push(`URL:${escapeIcsText(event.url)}`);
    }
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT1H');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${escapeIcsText('Kickball (1h before)')}`);
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function formatIcsLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}${m}${day}T${h}${min}${s}`;
}

function formatIcsUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}
