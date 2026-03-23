import type { Fixture, Game, PitchField, ScheduleData } from './types/schedule';
import teamsJson from '../data/teams.json';
import scheduleJson from '../data/schedule.json';

interface TeamDef {
  name: string;
  emoji: string;
  /** Primary fill hex (team colour). */
  color: string;
  /** Text/icon colour on solid team pill for contrast. */
  pillLabelColor: string;
}

const TEAMS = teamsJson as Record<string, TeamDef>;

type TeamName = keyof typeof teamsJson & string;

const ALL_TEAMS_PILL_LABEL = '#f1f5f9';

function teamColor(team: string): string {
  const t = TEAMS[team];
  return t != null ? t.color : '#cbd5e1';
}

function teamPillLabelColor(team: string): string {
  const t = TEAMS[team];
  return t != null ? t.pillLabelColor : ALL_TEAMS_PILL_LABEL;
}

const SCHEDULE_DATA = scheduleJson as ScheduleData;

const THEME_EMOJIS: Record<number, string> = {
  1: '📸',
  2: '🧙‍♀️',
  3: '🩰',
  4: '🩰',
  5: '🐣',
  6: '🤠',
  7: '🏈',
};

const FIELD_LUCIDE_ICONS: Record<PitchField, string> = {
  Kiosk: 'store',
  Road: 'navigation',
  Middle: 'crosshair',
  Water: 'droplets',
};

interface FieldLabelOpts {
  width?: number;
  height?: number;
  iconClass?: string;
}

function escapeHtml(str: unknown): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function lightColor(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.round(c * alpha + 255 * (1 - alpha));
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function darkenColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.round(r * 0.7)},${Math.round(g * 0.7)},${Math.round(b * 0.7)})`;
}

function setAccent(color: string): void {
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-light', lightColor(color, 0.12));
  document.documentElement.style.setProperty('--accent-dark', darkenColor(color));
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function fieldLucideIcon(fieldName: PitchField): string {
  return FIELD_LUCIDE_ICONS[fieldName];
}

function fieldLabelHtml(fieldName: PitchField, opts: FieldLabelOpts = {}): string {
  const icon = fieldLucideIcon(fieldName);
  const width = opts.width != null ? opts.width : 12;
  const height = opts.height != null ? opts.height : 12;
  const iconClass = opts.iconClass != null ? opts.iconClass : 'text-slate-400 shrink-0';
  return `<span class="inline-flex items-center gap-1.5 min-w-0"><i data-lucide="${icon}" class="${iconClass}" style="width:${width}px;height:${height}px" aria-hidden="true"></i><span>${escapeHtml(fieldName)}</span></span>`;
}

function detailedTeamChipHtml(team: string | null): string {
  if (team == null || team === '') return '';
  const bg = teamColor(team);
  const fg = teamPillLabelColor(team);
  return `<span class="detailed-team-chip" style="background:${bg};color:${fg};">${team}</span>`;
}

function matchupStripHtml(home: string | null, away: string | null): string {
  const homeBg = teamColor(home ?? '');
  const awayBg = teamColor(away ?? '');
  const homeFg = teamPillLabelColor(home ?? '');
  const awayFg = teamPillLabelColor(away ?? '');
  const label = `${home} vs ${away}`;
  return `<div class="matchup-strip" style="--matchup-home-bg:${homeBg};--matchup-away-bg:${awayBg};--matchup-home-fg:${homeFg};--matchup-away-fg:${awayFg}" role="img" aria-label="${escapeHtml(label)}">
    <div class="matchup-strip-bg" aria-hidden="true"></div>
    <span class="matchup-name matchup-name-home">${escapeHtml(home)}</span>
    <span class="matchup-vs" aria-hidden="true">vs</span>
    <span class="matchup-name matchup-name-away">${escapeHtml(away)}</span>
</div>`;
}

function teamInGame(team: TeamName, game: Game): boolean {
  for (const block of game.matches) {
    for (const f of block.fixtures) {
      if (f.home === team || f.away === team) return true;
    }
  }
  return false;
}

function isScheduledMatchup(f: Fixture): f is { field: PitchField; home: string; away: string } {
  return !('note' in f);
}

function isGameHiddenForFilteredTeam(team: TeamName, game: Game): boolean {
  return (
    !teamInGame(team, game) &&
    !game.fieldSetupTeams.includes(team) &&
    !game.fieldPackDownTeams.includes(team)
  );
}

function isCardHiddenForFilteredTeam(team: TeamName, games: Game[]): boolean {
  return !games.some(
    (g) =>
      teamInGame(team, g) || g.fieldSetupTeams.includes(team) || g.fieldPackDownTeams.includes(team)
  );
}

const ALL_TEAMS = Object.keys(TEAMS) as TeamName[];

const NEUTRAL_ACCENT = '#6b7280';

interface SelectTeamOptions {
  suppressHistory?: boolean;
  replaceUrl?: boolean;
}

let selectedTeam: TeamName | null = null;
let currentView: 'detailed' | 'simplified' = 'detailed';

function parseTeamFromUrl(): TeamName | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('team') || params.get('t');
  if (raw == null || raw === '') return null;
  const exact = ALL_TEAMS.find((t) => t === raw);
  if (exact != null) return exact;
  const found = ALL_TEAMS.find((t) => t.toLowerCase() === raw.toLowerCase());
  return found ?? null;
}

function setTeamInUrl(team: TeamName | null, mode: 'replace' | 'push'): void {
  const params = new URLSearchParams(window.location.search);
  if (team != null) {
    params.set('team', team);
  } else {
    params.delete('team');
  }
  const query = params.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  if (mode === 'replace') {
    history.replaceState(null, '', newUrl);
  } else {
    history.pushState(null, '', newUrl);
  }
}

function syncTeamFromUrl(): boolean {
  const urlTeam = parseTeamFromUrl();
  if (urlTeam === selectedTeam) return false;
  selectTeam(urlTeam, { suppressHistory: true });
  return true;
}

function buildTeamSelector(): void {
  const pillsContainer = document.getElementById('team-pills');
  const dropdown = document.getElementById('team-dropdown') as HTMLSelectElement | null;
  if (pillsContainer == null || dropdown == null) return;

  // All Teams pill
  const allPill = document.createElement('button');
  allPill.type = 'button';
  allPill.className = 'team-pill active';
  allPill.style.background = NEUTRAL_ACCENT;
  allPill.style.color = ALL_TEAMS_PILL_LABEL;
  allPill.textContent = 'All Teams';
  allPill.dataset.team = '';
  allPill.setAttribute('aria-pressed', 'true');
  allPill.setAttribute('aria-label', 'Show schedule for all teams');
  allPill.onclick = () => selectTeam(null);
  pillsContainer.appendChild(allPill);

  // All Teams dropdown option
  const allOpt = document.createElement('option');
  allOpt.value = '';
  allOpt.textContent = 'All Teams';
  dropdown.appendChild(allOpt);
  dropdown.value = '';

  // Sort teams alphabetically by name
  const sortedTeams = ALL_TEAMS.slice().sort();

  sortedTeams.forEach((team) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'team-pill';
    pill.style.background = TEAMS[team].color;
    pill.style.color = TEAMS[team].pillLabelColor;
    pill.textContent = team;
    pill.dataset.team = team;
    pill.setAttribute('aria-pressed', 'false');
    pill.setAttribute('aria-label', `Show schedule for ${team}`);
    pill.onclick = () => selectTeam(team);
    pillsContainer.appendChild(pill);

    const opt = document.createElement('option');
    opt.value = team;
    opt.textContent = team;
    dropdown.appendChild(opt);
  });
}

function selectTeamFromDropdown(val: string): void {
  selectTeam(val === '' ? null : (val as TeamName));
}

function selectTeam(team: TeamName | null, options: SelectTeamOptions = {}): void {
  const suppressHistory = options.suppressHistory === true;
  const replaceUrl = options.replaceUrl === true;

  selectedTeam = team;
  const color = team != null ? TEAMS[team].color : NEUTRAL_ACCENT;
  setAccent(color);

  // Update pills
  document.querySelectorAll('#team-pills .team-pill').forEach((p) => {
    const el = p as HTMLElement;
    const isOn = el.dataset.team === (team || '');
    el.classList.toggle('active', isOn);
    el.setAttribute('aria-pressed', isOn ? 'true' : 'false');
  });
  const teamDropdown = document.getElementById('team-dropdown') as HTMLSelectElement | null;
  if (teamDropdown != null) teamDropdown.value = team || '';

  // Always hide view toggle container
  const toggleContainer = document.getElementById('view-toggle-container');
  toggleContainer?.classList.add('hidden');

  // When team is selected, use simplified view; otherwise use detailed view
  if (selectedTeam != null) {
    currentView = 'simplified';
  } else {
    currentView = 'detailed';
  }

  updateSummary();
  renderCards();

  if (!suppressHistory) {
    setTeamInUrl(team, replaceUrl ? 'replace' : 'push');
  }
}

function switchView(view: 'detailed' | 'simplified'): void {
  currentView = view;
  updateViewToggleButtons();
  renderCards();
}

function setViewToggleButtonActive(btn: HTMLElement, active: boolean): void {
  if (active) {
    btn.style.background = 'var(--accent)';
    btn.style.color = '#ffffff';
    btn.style.borderColor = 'var(--accent)';
  } else {
    btn.style.background = '#ffffff';
    btn.style.color = '#64748b';
    btn.style.borderColor = '#e2e8f0';
  }
}

function updateViewToggleButtons(): void {
  const detailedBtn = document.getElementById('view-detailed-btn');
  const simplifiedBtn = document.getElementById('view-simplified-btn');
  if (detailedBtn == null || simplifiedBtn == null) return;

  const isDetailed = currentView === 'detailed';
  setViewToggleButtonActive(detailedBtn, isDetailed);
  setViewToggleButtonActive(simplifiedBtn, !isDetailed);
}

/** Same min-height for every simplified card so rows align across the whole grid. */
function equalizeSimplifiedCardHeights(): void {
  const grid = document.getElementById('simplified-grid');
  if (grid == null) return;
  const cards = [...grid.querySelectorAll('.simplified-card')] as HTMLElement[];
  if (cards.length === 0) return;
  cards.forEach((card) => {
    card.style.minHeight = '';
  });
  void grid.offsetHeight;
  let maxHeight = 0;
  cards.forEach((card) => {
    maxHeight = Math.max(maxHeight, card.offsetHeight);
  });
  if (maxHeight <= 0) return;
  cards.forEach((card) => {
    card.style.minHeight = `${maxHeight}px`;
  });
}

let simplifiedCardResizeTimer: ReturnType<typeof setTimeout> | undefined;
window.addEventListener('resize', () => {
  clearTimeout(simplifiedCardResizeTimer);
  simplifiedCardResizeTimer = setTimeout(() => {
    if (document.getElementById('simplified-grid') != null) {
      equalizeSimplifiedCardHeights();
    }
  }, 150);
});

function renderSimplifiedCards(): void {
  const container = document.getElementById('game-cards');
  if (container == null) return;
  container.innerHTML = '<div id="simplified-grid"></div>';

  const grid = document.getElementById('simplified-grid');
  if (grid == null) return;

  SCHEDULE_DATA.games.forEach((game) => {
    if (selectedTeam != null && isGameHiddenForFilteredTeam(selectedTeam, game)) return;

    // Collect matches for this game
    const matches: { time: string; fixture: Fixture; field: PitchField }[] = [];
    game.matches.forEach((block) => {
      block.fixtures.forEach((f) => {
        const isNA = !f.home && !f.away;
        const hasTeam =
          selectedTeam != null && (f.home === selectedTeam || f.away === selectedTeam);

        if (!isNA && hasTeam) {
          matches.push({ time: block.time, fixture: f, field: f.field });
        }
      });
    });

    // Build card for this individual game
    const card = document.createElement('div');
    card.className = 'simplified-card';
    card.dataset.cardId = String(game.gameNumber);

    let firstCardColor: string | null = null;
    let opponentPill = '';
    let dutiesSection = '';

    if (matches.length > 0 && selectedTeam != null) {
      const firstFx = matches[0].fixture;
      if (!isScheduledMatchup(firstFx)) return;
      const opp = firstFx.home === selectedTeam ? firstFx.away : firstFx.home;
      const oppColor = teamColor(opp);
      const oppLabel = teamPillLabelColor(opp);
      opponentPill = `<span class="simplified-opponent-pill" style="background:${oppColor};color:${oppLabel};">${opp}</span>`;
      firstCardColor = oppColor;

      // Badges for setup/packdown
      let allBadges = '';
      if (game.fieldSetupTeams.includes(selectedTeam) && game.fieldSetupTime) {
        allBadges += `<span class="simplified-badge simplified-badge-setup">
                        <i data-lucide="wrench" style="width:12px;height:12px;"></i> Field Setup ${game.fieldSetupTime}
                    </span>`;
      }
      if (game.fieldPackDownTeams.includes(selectedTeam) && game.fieldPackDownTime) {
        allBadges += `<span class="simplified-badge simplified-badge-packdown">
                        <i data-lucide="package" style="width:12px;height:12px;"></i> Field Pack Down ${game.fieldPackDownTime}
                    </span>`;
      }

      // Always render duties section - show badges if present, otherwise show "No duties" placeholder
      if (allBadges) {
        dutiesSection = `<div class="simplified-duties-section"><div class="simplified-badges">${allBadges}</div></div>`;
      } else {
        dutiesSection = `<div class="simplified-duties-section"><div class="simplified-badges">
                        <span class="simplified-duties-placeholder">
                            <i data-lucide="clipboard-check" style="width:12px;height:12px;"></i>
                            <span>No field duties</span>
                        </span>
                    </div></div>`;
      }

      const gameTitle = `Game ${game.gameNumber}`;
      const themeEmoji = THEME_EMOJIS[game.gameNumber] || '';

      let matchRows = '';
      matches.forEach((m) => {
        matchRows += `<div class="simplified-card-row">
                        <div class="simplified-time"><i data-lucide="clock" style="width:13px;height:13px;"></i><span>${m.time}</span></div>
                        <div class="simplified-field-tag"><i data-lucide="${fieldLucideIcon(m.field)}" style="width:11px;height:11px;"></i><span>${m.field} Field</span></div>
                    </div>`;
      });

      card.innerHTML = `
                    <div class="simplified-card-header">
                        <div class="simplified-card-top">
                            <div class="simplified-card-heading">
                                <span class="simplified-card-game-label">${gameTitle}</span>
                                <span class="simplified-card-meta-dot" aria-hidden="true">·</span>
                                <span class="simplified-card-date">${formatDate(game.date)}</span>
                            </div>
                            ${opponentPill}
                        </div>
                        <div class="simplified-card-theme">${themeEmoji} ${escapeHtml(game.theme)}</div>
                    </div>
                    <div class="simplified-card-content">
                        <div class="simplified-card-rows">${matchRows}</div>
                        ${dutiesSection}
                    </div>
                `;

      card.style.borderLeftColor = firstCardColor ?? oppColor;
      const oppRgb = hexToRgb(oppColor);
      card.style.setProperty('--opp-r', String(oppRgb.r));
      card.style.setProperty('--opp-g', String(oppRgb.g));
      card.style.setProperty('--opp-b', String(oppRgb.b));
      grid.appendChild(card);
    }
  });

  lucide.createIcons();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      equalizeSimplifiedCardHeights();
      setTimeout(() => {
        equalizeSimplifiedCardHeights();
        scheduleDeepLink();
      }, 120);
    });
  });
}

function updateSummary(): void {
  const panel = document.getElementById('team-summary');
  if (panel == null) return;
  if (selectedTeam == null) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');

  const team = selectedTeam;
  const setupGames: number[] = [];
  const packdownGames: number[] = [];

  SCHEDULE_DATA.games.forEach((g) => {
    if (g.fieldSetupTeams.includes(team)) setupGames.push(g.gameNumber);
    if (g.fieldPackDownTeams.includes(team)) packdownGames.push(g.gameNumber);
  });

  const summaryName = document.getElementById('summary-team-name');
  const summarySetup = document.getElementById('summary-setup');
  const summaryPackdown = document.getElementById('summary-packdown');
  if (summaryName == null || summarySetup == null || summaryPackdown == null) return;

  summaryName.textContent = `${TEAMS[team].emoji} ${team} · ${TEAMS[team].name}`;

  // Use darkened color for Apple team heading to ensure contrast
  let headingColor: string = TEAMS[team].color;
  if (team === 'Apple') {
    headingColor = darkenColor(TEAMS[team].color);
  }
  summaryName.style.color = headingColor;

  summarySetup.textContent = setupGames.length
    ? setupGames.map((n) => `Game ${n}`).join(', ')
    : 'None';
  summaryPackdown.textContent = packdownGames.length
    ? packdownGames.map((n) => `Game ${n}`).join(', ')
    : 'None';
}

function renderCards(): void {
  if (currentView === 'simplified' && selectedTeam != null) {
    renderSimplifiedCards();
    return;
  }

  const container = document.getElementById('game-cards');
  if (container == null) return;
  // Preserve collapse state
  const collapseState: Record<string, boolean> = {};
  container.querySelectorAll('[data-game-id]').forEach((card) => {
    const el = card as HTMLElement;
    const body = el.querySelector('.card-body');
    const gameId = el.dataset.gameId;
    if (body != null && gameId != null)
      collapseState[gameId] = body.classList.contains('collapsed');
  });

  container.innerHTML = '';

  // Track which games have been merged
  const mergedGames = new Set<number>();

  SCHEDULE_DATA.games.forEach((game, idx) => {
    // Skip if this game was already merged
    if (mergedGames.has(game.gameNumber)) return;

    // Check if next game shares same date (for double headers)
    const nextGame = idx + 1 < SCHEDULE_DATA.games.length ? SCHEDULE_DATA.games[idx + 1] : null;
    const isDoubleHeader = nextGame != null && nextGame.date === game.date;

    let gamesToRender: Game[] = [game];
    let cardId: string = String(game.gameNumber);
    let cardTitle = game.title;
    let cardSubtitle = '';

    if (isDoubleHeader && nextGame != null) {
      gamesToRender = [game, nextGame];
      cardId = `${game.gameNumber}-${nextGame.gameNumber}`;
      cardTitle = `Game ${game.gameNumber} & ${nextGame.gameNumber}`;
      cardSubtitle = 'Double Header';
      mergedGames.add(nextGame.gameNumber);
    }

    const cardHidden =
      selectedTeam != null && isCardHiddenForFilteredTeam(selectedTeam, gamesToRender)
        ? 'card-hidden'
        : '';

    const card = document.createElement('article');
    card.className = `bg-white rounded-xl shadow-md border border-slate-200/90 overflow-hidden accent-border mb-4 ${cardHidden}`;
    card.dataset.gameId = cardId;

    // Check if game date is strictly before today for auto-collapse
    const gameDate = new Date(`${gamesToRender[0].date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastGame = gameDate < today;

    const isCollapsed = collapseState[cardId] !== undefined ? collapseState[cardId] : isPastGame;

    // Collect all badges from all games in this card
    let allBadges = '';
    let photoDayPill = '';
    gamesToRender.forEach((g) => {
      // Photo Day pill for Game 1
      if (g.gameNumber === 1) {
        photoDayPill = `<span class="photo-day-pill" title="Photo theme this game"><span class="photo-day-pill-emoji" aria-hidden="true">📸</span><span class="photo-day-pill-label">Photo Day</span></span>`;
      }

      // Setup badge: only render if team is selected and on setup duty, or not selected
      if (g.fieldSetupTime) {
        const setupHasTeam = selectedTeam != null && g.fieldSetupTeams.includes(selectedTeam);
        const shouldRender = selectedTeam == null || setupHasTeam;
        if (shouldRender) {
          const setupBadgeBody =
            selectedTeam != null
              ? `Field Setup ${g.fieldSetupTime}`
              : `Field Setup ${g.fieldSetupTime} — <span class="inline-flex flex-wrap items-center gap-1">${g.fieldSetupTeams.map((t) => detailedTeamChipHtml(t)).join('')}</span>`;
          allBadges += `<span class="inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-semibold badge-setup">
                            <i data-lucide="wrench" style="width:12px;height:12px;"></i> ${setupBadgeBody}
                        </span>`;
        }
      }

      // Pack down badge: only render if team is selected and on pack down duty, or not selected
      if (g.fieldPackDownTime) {
        const packdownHasTeam = selectedTeam != null && g.fieldPackDownTeams.includes(selectedTeam);
        const shouldRender = selectedTeam == null || packdownHasTeam;
        if (shouldRender) {
          const packdownBadgeBody =
            selectedTeam != null
              ? `Field Pack Down ${g.fieldPackDownTime}`
              : `Field Pack Down ${g.fieldPackDownTime} — <span class="inline-flex flex-wrap items-center gap-1">${g.fieldPackDownTeams.map((t) => detailedTeamChipHtml(t)).join('')}</span>`;
          allBadges += `<span class="inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-semibold badge-packdown">
                            <i data-lucide="package" style="width:12px;height:12px;"></i> ${packdownBadgeBody}
                        </span>`;
        }
      }
    });

    // Collect all match blocks from all games
    let matchesHTML = '';
    gamesToRender.forEach((g) => {
      g.matches.forEach((block) => {
        let rows = '';
        let blockHasVisibleRows = false;

        block.fixtures.forEach((f) => {
          const isNA = !f.home && !f.away;
          if (isNA) {
            return;
          }
          if (!isScheduledMatchup(f)) {
            return;
          }

          const hasTeam =
            selectedTeam != null && (f.home === selectedTeam || f.away === selectedTeam);

          // Hide match rows that don't involve the selected team
          if (selectedTeam != null && !hasTeam) {
            return;
          }

          blockHasVisibleRows = true;
          const rowClass = hasTeam ? 'match-row-highlight' : '';

          if (selectedTeam == null) {
            rows += `<tr class="${rowClass}">
                            <td class="px-3 py-2.5 text-xs font-semibold text-slate-500 align-top">${fieldLabelHtml(f.field)}</td>
                            <td class="px-3 py-2 align-middle">${matchupStripHtml(f.home, f.away)}</td>
                        </tr>`;
          } else {
            const homeCell = detailedTeamChipHtml(f.home);
            const awayCell = detailedTeamChipHtml(f.away);

            rows += `<tr class="${rowClass}">
                            <td class="px-3 py-2.5 text-xs font-semibold text-slate-500">${fieldLabelHtml(f.field)}</td>
                            <td class="px-3 py-2.5 align-middle">${homeCell}</td>
                            <td class="px-3 py-2.5 text-xs font-semibold text-slate-400 text-center align-middle">vs</td>
                            <td class="px-3 py-2.5 align-middle">${awayCell}</td>
                        </tr>`;
          }
        });

        if (!blockHasVisibleRows) {
          return;
        }

        const theadAllTeams = `
                                <thead>
                                    <tr>
                                        <th class="px-3 py-2 text-xs font-semibold text-slate-600 w-20">Field</th>
                                        <th class="px-3 py-2 text-xs font-semibold text-slate-600">Matchup</th>
                                    </tr>
                                </thead>`;
        const theadFiltered = `
                                <thead>
                                    <tr>
                                        <th class="px-3 py-2 text-xs font-semibold text-slate-600 w-20">Field</th>
                                        <th class="px-3 py-2 text-xs font-semibold text-slate-600">Home</th>
                                        <th class="px-3 py-2 text-xs font-semibold text-slate-400 w-10 text-center"> </th>
                                        <th class="px-3 py-2 text-xs font-semibold text-slate-600">Away</th>
                                    </tr>
                                </thead>`;

        matchesHTML += `
                    <div class="mb-4">
                        <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                            <i data-lucide="clock" style="width:12px;height:12px;"></i> ${block.time}
                        </div>
                        <div class="overflow-x-auto detailed-match-table-shell">
                            <table class="w-full text-left">
                                ${selectedTeam ? theadFiltered : theadAllTeams}
                                <tbody>${rows}</tbody>
                            </table>
                        </div>
                    </div>`;
      });
    });

    // Use theme and description from first game
    const themeDescription = gamesToRender[0].themeDescription;
    const postPlaySocial = gamesToRender[0].postPlaySocial;

    card.innerHTML = `
                <div class="detailed-card-header cursor-pointer px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/90 select-none" onclick="toggleCard('${cardId}')">
                    <div>
                        <h2 class="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>${cardTitle}</span>
                            ${photoDayPill}
                        </h2>
                        ${cardSubtitle ? `<p class="text-xs text-slate-400 font-medium">${cardSubtitle}</p>` : ''}
                        <p class="text-sm text-slate-500 mt-1">${formatDate(gamesToRender[0].date)} · <span class="font-semibold accent-text">${gamesToRender[0].theme}</span></p>
                    </div>
                    <i data-lucide="${isCollapsed ? 'chevron-down' : 'chevron-up'}" class="text-slate-400 shrink-0" style="width:20px;height:20px;" id="chevron-${cardId}"></i>
                </div>
                <div class="card-body ${isCollapsed ? 'collapsed' : ''}" id="card-body-${cardId}">
                    <div class="px-4 pt-3 pb-4">
                        <p class="text-sm text-slate-600 italic mb-4 leading-relaxed">${themeDescription}</p>
                        <div class="flex flex-wrap gap-2 mb-5">
                            ${allBadges}
                        </div>
                        <div class="mb-1">
                            ${matchesHTML}
                        </div>
                        <div class="pt-4 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                            <i data-lucide="beer" style="width:13px;height:13px;"></i>
                            Post-play: <span class="font-semibold text-slate-700">${postPlaySocial}</span>
                        </div>
                    </div>
                </div>
            `;

    container.appendChild(card);
  });

  lucide.createIcons();
  scheduleDeepLink();
}

function parseGameNumberFromUrl(): number | null {
  const params = new URLSearchParams(window.location.search);
  let raw: string | null = params.get('game') || params.get('g');
  if (raw == null || raw === '') {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('game-')) {
      raw = hash.slice(5);
    } else if (/^\d+$/.test(hash)) {
      raw = hash;
    }
  }
  if (raw == null || raw === '') return null;
  const n = parseInt(String(raw), 10);
  if (Number.isNaN(n)) return null;
  return n;
}

function findCardElementForGame(gameNum: number): Element | null {
  const simplified = document.querySelector(`[data-card-id="${gameNum}"]`);
  if (simplified != null) return simplified;
  const exact = document.querySelector(`[data-game-id="${gameNum}"]`);
  if (exact != null) return exact;
  const cards = document.querySelectorAll('[data-game-id]');
  for (const card of cards) {
    const el = card as HTMLElement;
    const id = el.dataset.gameId;
    if (id == null) continue;
    if (id.includes('-')) {
      const parts = id.split('-');
      if (parts.includes(String(gameNum))) return card;
    }
  }
  return null;
}

function applyDeepLink(): void {
  const gameNum = parseGameNumberFromUrl();
  if (gameNum == null) return;
  const el = findCardElementForGame(gameNum);
  if (el == null) return;
  if (el.classList.contains('card-hidden')) return;
  const gameId = (el as HTMLElement).dataset.gameId;
  if (gameId != null) {
    const body = document.getElementById(`card-body-${gameId}`);
    if (body != null && body.classList.contains('collapsed')) {
      toggleCard(gameId);
    }
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('deep-link-highlight');
  setTimeout(() => el.classList.remove('deep-link-highlight'), 2600);
}

function scheduleDeepLink(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(applyDeepLink);
  });
}

function toggleCard(cardId: string): void {
  const body = document.getElementById(`card-body-${cardId}`);
  const chevron = document.getElementById(`chevron-${cardId}`);
  if (body == null || chevron == null) return;
  if (body.classList.contains('collapsed')) {
    body.classList.remove('collapsed');
    chevron.setAttribute('data-lucide', 'chevron-up');
  } else {
    body.classList.add('collapsed');
    chevron.setAttribute('data-lucide', 'chevron-down');
  }
  lucide.createIcons();
}

window.addEventListener('popstate', () => {
  if (!syncTeamFromUrl()) scheduleDeepLink();
});
window.addEventListener('hashchange', scheduleDeepLink);

setAccent(NEUTRAL_ACCENT);
buildTeamSelector();
const urlTeam = parseTeamFromUrl();
if (urlTeam != null) {
  selectTeam(urlTeam, { replaceUrl: true });
} else {
  renderCards();
}
lucide.createIcons();

window.toggleCard = toggleCard;
window.switchView = switchView;
window.selectTeamFromDropdown = selectTeamFromDropdown;
