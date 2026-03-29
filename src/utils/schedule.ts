import type { ScheduleData } from '../types/schedule';

const ALL_TEAMS_PILL_LABEL = '#f1f5f9';

export function teamColor(teams: ScheduleData['teams'], team: string): string {
  const teamDef = teams[team];
  return teamDef != null ? teamDef.color : '#cbd5e1';
}

export function teamPillLabelColor(teams: ScheduleData['teams'], team: string): string {
  const teamDef = teams[team];
  return teamDef != null ? teamDef.pillLabelColor : ALL_TEAMS_PILL_LABEL;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return { r: red, g: green, b: blue };
}

/** Blends `hex` toward white. `weight` is the fraction of the team colour (0 = white, 1 = full). */
export function lightenTowardWhite(hex: string, weight: number): string {
  const { r: red, g: green, b: blue } = hexToRgb(hex);
  const blendChannel = (channel: number) => Math.round(channel * weight + 255 * (1 - weight));
  return `rgb(${blendChannel(red)},${blendChannel(green)},${blendChannel(blue)})`;
}

export function darkenColor(hex: string): string {
  const { r: red, g: green, b: blue } = hexToRgb(hex);
  return `rgb(${Math.round(red * 0.7)},${Math.round(green * 0.7)},${Math.round(blue * 0.7)})`;
}

export function formatDate(dateStr: string): string {
  const parsedDate = new Date(`${dateStr}T00:00:00`);
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Safe filename segment for downloads (ICS, PNG, etc.). */
export function slugForTeamFilename(team: string): string {
  return team
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
