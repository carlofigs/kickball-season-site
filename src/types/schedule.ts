/** Aligns with `data/schedule.schema.json`. */

/** Fixture pitch names — must match `definitions.pitchField` in the schema. */
export type PitchField = 'Kiosk' | 'Road' | 'Middle' | 'Water';

export type Fixture =
  | {
      field: PitchField;
      home: string;
      away: string;
    }
  | {
      field: PitchField;
      home: null;
      away: null;
      note: string;
    };

export interface MatchBlock {
  time: string;
  fixtures: Fixture[];
}

export interface Game {
  gameNumber: number;
  date: string;
  title: string;
  theme: string;
  themeDescription: string;
  fieldSetupTime: string | null;
  fieldPackDownTime: string | null;
  fieldSetupTeams: string[];
  fieldPackDownTeams: string[];
  matches: MatchBlock[];
  postPlaySocial: string;
}

export interface ScheduleData {
  games: Game[];
}
