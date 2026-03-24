import { ChevronDown } from 'lucide-react';
import type { ScheduleData } from '../types/schedule';
import styles from './index.module.css';

const NEUTRAL = '#6b7280';
const ALL_LABEL = '#f1f5f9';

type Props = {
  teams: ScheduleData['teams'];
  selectedTeam: string | null;
  onSelect: (team: string | null) => void;
};

export function TeamSelector({ teams, selectedTeam, onSelect }: Props) {
  const names = Object.keys(teams);
  const sorted = names.slice().sort();

  return (
    <nav
      className="sticky top-[env(safe-area-inset-top)] z-30 border-b backdrop-blur-md"
      aria-label="Team schedule filter"
      style={{
        background:
          'linear-gradient(180deg, var(--chrome-c) 0%, color-mix(in srgb, var(--chrome-b) 72%, #ffffff) 55%, #ffffff 100%)',
        borderBottomColor: 'var(--chrome-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 md:py-3">
        <p
          className="block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2"
          id="team-filter-heading"
        >
          Filter by team
        </p>
        <div
          className="hidden md:block rounded-[0.625rem] border p-2 md:p-2.5"
          role="group"
          aria-labelledby="team-filter-heading"
          style={{
            background: 'color-mix(in srgb, var(--chrome-b) 42%, #ffffff)',
            borderColor: 'color-mix(in srgb, var(--accent) 10%, rgb(15 23 42 / 0.06))',
          }}
        >
          <div className="grid grid-cols-3 gap-[0.35rem] sm:grid-cols-4 min-[900px]:grid-cols-5 min-[1100px]:grid-cols-6 xl:grid-cols-8">
            <button
              type="button"
              className={`${styles.pill} ${selectedTeam == null ? styles.pillActive : ''}`}
              style={{
                background: NEUTRAL,
                color: ALL_LABEL,
              }}
              data-team=""
              aria-pressed={selectedTeam == null}
              aria-label="Show schedule for all teams"
              onClick={() => onSelect(null)}
            >
              All Teams
            </button>
            {sorted.map((team) => (
              <button
                key={team}
                type="button"
                className={`${styles.pill} ${selectedTeam === team ? styles.pillActive : ''}`}
                style={{
                  background: teams[team].color,
                  color: teams[team].pillLabelColor,
                }}
                data-team={team}
                aria-pressed={selectedTeam === team}
                aria-label={`Show schedule for ${team}`}
                onClick={() => onSelect(team)}
              >
                {team}
              </button>
            ))}
          </div>
        </div>
        <div className="relative md:hidden">
          <select
            className="w-full min-h-[2.75rem] appearance-none rounded-lg border bg-white py-2 pl-3 pr-10 text-sm font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ borderColor: 'var(--chrome-border)' }}
            aria-label="Choose a team to filter the schedule"
            value={selectedTeam ?? ''}
            onChange={(changeEvent) => {
              const selectedValue = changeEvent.target.value;
              onSelect(selectedValue === '' ? null : selectedValue);
            }}
          >
            <option value="">All Teams</option>
            {sorted.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400"
            aria-hidden
          >
            <ChevronDown className="size-5 shrink-0" strokeWidth={2} />
          </span>
        </div>
      </div>
    </nav>
  );
}
