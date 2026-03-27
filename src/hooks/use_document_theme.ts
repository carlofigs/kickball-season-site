import { useEffect } from 'react';
import type { ScheduleData } from '../types/schedule';
import { darkenColor, lightenTowardWhite } from '../utils/schedule';

const NEUTRAL_ACCENT = '#6b7280';

/**
 * Syncs `--accent*`, `--chrome-*`, and `theme-color` meta to the selected team (or neutral).
 */
export function useDocumentTheme(selectedTeam: string | null, teams: ScheduleData['teams']): void {
  useEffect(() => {
    const color = selectedTeam != null ? teams[selectedTeam].color : NEUTRAL_ACCENT;
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-light', lightenTowardWhite(color, 0.12));
    document.documentElement.style.setProperty('--accent-dark', darkenColor(color));

    let chromeB: string;
    if (selectedTeam == null) {
      document.documentElement.style.setProperty('--chrome-a', '#ffffff');
      chromeB = '#f8fafc';
      document.documentElement.style.setProperty('--chrome-b', chromeB);
      document.documentElement.style.setProperty('--chrome-c', '#f1f5f9');
      document.documentElement.style.setProperty('--chrome-border', 'rgba(226, 232, 240, 0.95)');
    } else {
      const teamHex = teams[selectedTeam].color;
      document.documentElement.style.setProperty('--chrome-a', lightenTowardWhite(teamHex, 0.04));
      chromeB = lightenTowardWhite(teamHex, 0.06);
      document.documentElement.style.setProperty('--chrome-b', chromeB);
      document.documentElement.style.setProperty('--chrome-c', lightenTowardWhite(teamHex, 0.13));
      document.documentElement.style.setProperty(
        '--chrome-border',
        `color-mix(in srgb, ${teamHex} 24%, rgb(226 232 240))`
      );
    }

    const themeMeta = document.getElementById('theme-color-meta');
    if (themeMeta != null) {
      themeMeta.setAttribute('content', colorForMetaTag(chromeB));
    }
  }, [selectedTeam, teams]);
}

/** iOS Safari prefers hex in `theme-color`; CSS vars may use `rgb()`. */
function colorForMetaTag(cssColor: string): string {
  const trimmed = cssColor.trim();
  if (trimmed.startsWith('#')) return trimmed;
  const match = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(trimmed);
  if (match == null) return '#f8fafc';
  const toHex = (channel: string) => Number.parseInt(channel, 10).toString(16).padStart(2, '0');
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}
