/**
 * Maps arbitrary team hex colours to the nearest Apple Calendar–style swatch.
 * Colours approximate the iOS / macOS Calendar picker (not exact).
 */

/**
 * Apple-ish calendar palette (UI swatches, best-effort).
 * Covers reds through teals, browns, greys, and a near-black.
 */
const APPLE_CALENDAR_SWATCHES: readonly string[] = [
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#34C759',
  '#30D158',
  '#00C7BE',
  '#32D4DE',
  '#007AFF',
  '#5AC8FA',
  '#5856D6',
  '#AF52DE',
  '#FF2D55',
  '#FF6482',
  '#A2845E',
  '#8E8E93',
  '#636366',
  '#3A3A3C',
  '#1C1C1E',
];

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(normalized);
  if (match == null) return null;
  const value = match[1];
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function squaredDistance(
  channelA: { r: number; g: number; b: number },
  channelB: { r: number; g: number; b: number }
): number {
  const dr = channelA.r - channelB.r;
  const dg = channelA.g - channelB.g;
  const db = channelA.b - channelB.b;
  return dr * dr + dg * dg + db * db;
}

/** Returns `#RRGGBB` from {@link APPLE_CALENDAR_SWATCHES} nearest to `teamHex`. */
export function mapTeamHexToAppleCalendarColor(teamHex: string): string {
  const target = parseHexRgb(teamHex);
  if (target == null) return '#8E8E93';

  let best = APPLE_CALENDAR_SWATCHES[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const swatch of APPLE_CALENDAR_SWATCHES) {
    const candidate = parseHexRgb(swatch);
    if (candidate == null) continue;
    const distance = squaredDistance(target, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = swatch;
    }
  }
  return best.toUpperCase();
}
