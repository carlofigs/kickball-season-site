import { useRef, useState, type RefObject } from 'react';
import type { ScheduleData } from '../types/schedule';
import { exportTeamSchedulePng as captureTeamScheduleToPng } from '../utils/png_export';

type TeamSchedulePngExportData = {
  teamScheduleExportRef: RefObject<HTMLDivElement | null>;
  exportPngPending: boolean;
};

type TeamSchedulePngExportActions = {
  /** Resolves to `true` when the PNG was generated and saved; `false` otherwise. */
  onExportTeamSchedulePng: () => Promise<boolean>;
};

export function useTeamSchedulePngExport(
  selectedTeam: string | null,
  teams: ScheduleData['teams']
): [TeamSchedulePngExportData, TeamSchedulePngExportActions] {
  const [exportPngPending, setExportPngPending] = useState(false);
  const teamScheduleExportRef = useRef<HTMLDivElement>(null);

  async function onExportTeamSchedulePng(): Promise<boolean> {
    if (selectedTeam == null) return false;
    const element = teamScheduleExportRef.current;
    if (element == null) {
      window.alert('Could not find the schedule to export.');
      return false;
    }
    setExportPngPending(true);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    try {
      const teamDef = teams[selectedTeam];
      await captureTeamScheduleToPng(element, selectedTeam, {
        title: `${teamDef.emoji} ${teamDef.name} — kickball schedule`,
        text: `Kickball season schedule for ${teamDef.name} (${selectedTeam})`,
      });
      return true;
    } catch (error) {
      console.error(error);
      window.alert('Could not export PNG. Try again in a moment.');
      return false;
    } finally {
      setExportPngPending(false);
    }
  }

  const data: TeamSchedulePngExportData = {
    teamScheduleExportRef,
    exportPngPending,
  };
  const actions: TeamSchedulePngExportActions = { onExportTeamSchedulePng };
  return [data, actions];
}
