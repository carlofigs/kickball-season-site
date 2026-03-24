/** Aligns with `data/schedule.schema.json`. */

/** Display metadata for a colour team (keyed by short name in `teams`). */
export interface TeamDef {
  name: string;
  emoji: string;
  /** Primary fill hex (team colour). */
  color: string;
  /** Text/icon colour on solid team pill for contrast. */
  pillLabelColor: string;
}

/** Fixture pitch names — must match `definitions.pitchField` in the schema. */
export type PitchField = 'Kiosk' | 'Road' | 'Middle' | 'Water';

export interface Fixture {
  field: PitchField;
  home: string;
  away: string;
  lineRefTeam: string;
}

export interface MatchBlock {
  time: string;
  fixtures: Fixture[];
}

export interface Game {
  gameNumber: number;
  date: string;
  title: string;
  theme: string;
  themeEmoji: string;
  themeDescription: string;
  fieldSetupTime: string | null;
  fieldPackDownTime: string | null;
  fieldSetupTeams: string[];
  fieldPackDownTeams: string[];
  matches: MatchBlock[];
  postPlaySocial: string;
}

export interface ScheduleData {
  teams: Record<string, TeamDef>;
  games: Game[];
}
