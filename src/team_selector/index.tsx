import { ChevronDown } from 'lucide-react';
import type { ScheduleData } from '../types/schedule';
import { useToast } from '../shared/toast/toast_provider';
import { buildShareableScheduleUrl } from '../utils/routing';
import { ScheduleOptionsMenu } from './schedule_options_menu';

type Props = {
  teams: ScheduleData['teams'];
  selectedTeam: string | null;
  onSelect: (team: string | null) => void;
  onAddTeamCalendar: () => void;
  onExportTeamSchedulePng: () => Promise<void>;
  exportPngPending: boolean;
};

export function TeamSelector({
  teams,
  selectedTeam,
  onSelect,
  onAddTeamCalendar,
  onExportTeamSchedulePng,
  exportPngPending,
}: Props) {
  const { showToast } = useToast();
  const names = Object.keys(teams);
  const sorted = names.slice().sort();

  async function handleCopyShareableUrl() {
    const url = buildShareableScheduleUrl(
      selectedTeam == null ? { mode: 'all-teams' } : { mode: 'team', teamShortName: selectedTeam }
    );
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard');
    } catch {
      window.alert('Could not copy the link. You can copy it from the address bar instead.');
    }
  }

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
        <div className="relative flex gap-2 items-stretch">
          <div className="relative min-w-0 flex-1">
            <select
              className="w-full min-h-[2.75rem] cursor-pointer appearance-none rounded-lg border bg-white py-2 pl-3 pr-10 text-sm font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <ScheduleOptionsMenu
            onAddToCalendar={selectedTeam != null ? onAddTeamCalendar : undefined}
            copyShareableUrlLabel={
              selectedTeam == null ? 'Copy schedule link' : 'Copy team schedule link'
            }
            onCopyShareableUrl={handleCopyShareableUrl}
            showExportPng={selectedTeam != null}
            onExportPng={onExportTeamSchedulePng}
            exportPngPending={exportPngPending}
          />
        </div>
      </div>
    </nav>
  );
}
