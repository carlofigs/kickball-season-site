import { useState } from 'react';
import { useDocumentTheme } from './hooks/use_document_theme';
import { useScheduleRouting } from './hooks/use_schedule_routing';
import { useTeamSchedulePngExport } from './hooks/use_team_schedule_png_export';
import scheduleJson from '../data/schedule.json';
import { Footer } from './footer';
import { Header } from './header';
import type { ScheduleData } from './types/schedule';
import { Content } from './content';
import { downloadTeamScheduleIcs } from './utils/calendar';
import { LoadingOverlay } from './loading_overlay';
import { useToast } from './shared/toast/toast_provider';
import { TeamSelector } from './team_selector';

const scheduleData = scheduleJson as ScheduleData;

/** When this bundle ran (page load); schedule JSON is fresh for this moment. */
const PAGE_LOADED_AT = new Date();

/** Stable list for URL parsing — avoids recreating `Object.keys` each render. */
const ALL_TEAM_NAMES = Object.keys(scheduleData.teams);

export function App() {
  const [collapsedByCard, setCollapsedByCard] = useState<Record<string, boolean>>({});
  const [{ selectedTeam }, { selectTeam }] = useScheduleRouting(ALL_TEAM_NAMES, setCollapsedByCard);
  const [
    { teamScheduleExportRef, exportPngPending },
    { onExportTeamSchedulePng: runTeamSchedulePngExport },
  ] = useTeamSchedulePngExport(selectedTeam, scheduleData.teams);
  const { showToast } = useToast();

  useDocumentTheme(selectedTeam, scheduleData.teams);

  async function onExportTeamSchedulePng() {
    const exported = await runTeamSchedulePngExport();
    if (exported) {
      showToast('Schedule exported as PNG');
    }
  }

  function handleToggleCard(cardId: string, defaultCollapsedIfUnset: boolean) {
    setCollapsedByCard((previous) => {
      const currentCollapsed =
        previous[cardId] !== undefined ? previous[cardId] : defaultCollapsedIfUnset;
      return { ...previous, [cardId]: !currentCollapsed };
    });
  }

  function handleAddTeamCalendar() {
    if (selectedTeam == null) return;
    downloadTeamScheduleIcs(scheduleData, selectedTeam);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Opaque band for the status-bar safe area so scrolling content does not show
          through `black-translucent` when the header has scrolled away. */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 right-0 z-20"
        style={{
          height: 'env(safe-area-inset-top, 0px)',
          background: 'linear-gradient(165deg, var(--chrome-a) 0%, var(--chrome-b) 100%)',
        }}
      />
      <Header />
      <TeamSelector
        teams={scheduleData.teams}
        selectedTeam={selectedTeam}
        onSelect={selectTeam}
        onAddTeamCalendar={handleAddTeamCalendar}
        onExportTeamSchedulePng={onExportTeamSchedulePng}
        exportPngPending={exportPngPending}
      />
      <Content
        schedule={scheduleData}
        teams={scheduleData.teams}
        selectedTeam={selectedTeam}
        collapsedByCard={collapsedByCard}
        onToggleCard={handleToggleCard}
        teamScheduleExportRef={teamScheduleExportRef}
        schedulePageLoadedAt={PAGE_LOADED_AT}
      />
      <Footer />
      {exportPngPending && selectedTeam != null ? (
        <LoadingOverlay
          teamName={scheduleData.teams[selectedTeam].name}
          teamEmoji={scheduleData.teams[selectedTeam].emoji}
        />
      ) : null}
    </div>
  );
}
