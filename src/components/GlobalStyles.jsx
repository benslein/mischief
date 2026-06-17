export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Baloo+2:wght@400;600;800&display=swap');

      :root {
        --bg: #1b1f3a;
        --panel: #2b2f55;
        --panel-border: #4a4f7a;
        --panel-light: #3a3f6e;
        --accent: #ffd166;
        --accent-2: #06d6a0;
        --text: #ffffff;
        --text-dim: #9aa3c7;
        --field-1: #3f8f4f;
        --field-2: #347d40;
        --field-line: #f1f1f1;
        --header-h: 58px;
        --sidebar-w: 320px;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }

      html, body, #root { height: 100%; overflow: hidden; }

      .pp-app {
        font-family: 'Baloo 2', sans-serif;
        background: var(--bg);
        color: var(--text);
        height: 100dvh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }

      /* ── TOP BAR ─────────────────────────────────────────────────── */
      .pp-topbar {
        height: var(--header-h);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 0 16px;
        background: var(--panel);
        border-bottom: 3px solid var(--panel-border);
      }
      .pp-topbar-title { font-family: 'Press Start 2P', monospace; font-size: 13px; color: var(--accent); white-space: nowrap; }
      .pp-topbar-logo { background: none; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; }
      .pp-topbar-team {
        font-family: 'Press Start 2P', monospace; font-size: 10px;
        background: var(--bg); border: 2px solid var(--panel-border);
        color: var(--accent); padding: 5px 8px; text-transform: uppercase; outline: none; width: 150px;
      }
      .pp-topbar-team:focus { border-color: var(--accent); }
      .pp-topbar-nav { display: flex; gap: 6px; margin-left: auto; }
      .pp-nav-btn {
        font-family: 'Press Start 2P', monospace; font-size: 9px;
        padding: 8px 12px; background: var(--bg); color: var(--text-dim);
        border: 2px solid var(--panel-border); cursor: pointer; white-space: nowrap;
      }
      .pp-nav-btn.active { color: var(--accent); border-color: var(--accent); }
      .pp-nav-btn:disabled { opacity: 0.4; cursor: default; }
      .pp-nav-btn-extreme { color: #e63946; border-color: #e63946; }
      .pp-nav-btn-extreme.active { color: #ff8fa3; border-color: #ff8fa3; background: rgba(230,57,70,0.15); }
      .pp-nav-btn-extreme:disabled { color: var(--text-dim); border-color: var(--panel-border); }
      .pp-coach-link {
        background: var(--bg); border: 2px solid var(--panel-border); border-radius: 4px;
        color: var(--text-dim); font-size: 16px; cursor: pointer; padding: 6px 9px;
        flex-shrink: 0; line-height: 1;
      }
      .pp-coach-link:hover { color: var(--accent); border-color: var(--accent); }
      .pp-coach-link.active { color: var(--accent); border-color: var(--accent); background: var(--panel-light); }

      /* ── INTRO SCREEN ────────────────────────────────────────────── */
      .pp-intro {
        flex: 1; display: flex; align-items: center; justify-content: center;
        padding: 24px; overflow: auto; min-height: 0;
      }
      .pp-intro-content {
        max-width: 480px; width: 100%; display: flex; flex-direction: column;
        align-items: center; gap: 18px;
      }
      .pp-dance-row { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
      .pp-intro-card {
        max-width: 420px; width: 100%; display: flex; flex-direction: column;
        align-items: center; gap: 14px; text-align: center;
      }
      .pp-intro-balls { display: flex; gap: 18px; }
      .pp-intro-title {
        font-size: 22px; color: var(--accent); letter-spacing: 1px;
        text-shadow: 3px 3px 0 rgba(0,0,0,0.35);
      }
      .pp-intro-welcome { font-size: 16px; font-weight: 800; color: var(--text); }
      .pp-intro-record { font-size: 11px; color: var(--text-dim); letter-spacing: 0.5px; }
      .pp-record-w { color: var(--accent-2); font-weight: 800; }
      .pp-record-l { color: #e63946; font-weight: 800; }
      .pp-record-d { color: var(--text-dim); font-weight: 800; }
      .pp-intro-actions { display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 8px; }
      .pp-intro-actions .pp-btn { padding: 14px; font-size: 11px; }
      .pp-btn-extreme { color: #e63946; border-color: #e63946; }
      .pp-btn-extreme:hover { background: rgba(230,57,70,0.12); }

      /* Short viewports (phones in landscape) - the dancing rows are a nice
         touch but the title, welcome line, and buttons are what actually
         matter, so this trims and shrinks rather than letting the buttons
         get pushed below an invisible scroll boundary. Thresholds are on
         height, not width, since landscape phones are wide but short. */
      @media (max-height: 420px) {
        .pp-intro { padding: 10px; }
        .pp-intro-content { gap: 8px; }
        .pp-dance-row { gap: 6px; }
        .pp-dance-row svg { width: 26px !important; height: 35px !important; }
        .pp-intro-balls { display: none; }
        .pp-intro-title { font-size: 15px; }
        .pp-intro-welcome { font-size: 12px; }
        .pp-intro-content .pp-hint { display: none; }
        .pp-intro-actions { gap: 6px; margin-top: 4px; }
        .pp-intro-actions .pp-btn { padding: 8px; font-size: 9px; }
      }
      @media (max-height: 320px) {
        .pp-dance-row { display: none; }
      }

      /* ── CREATE A TEAM: NAME STEP ────────────────────────────────── */
      .pp-team-name-input {
        width: 100%; font-size: 14px; padding: 12px; text-align: center;
      }

      /* ── CREATE A TEAM: VENUE STEP ───────────────────────────────── */
      /* This screen can have more content than fits a short landscape
         phone, so unlike the other intro-family screens, it pins its
         title/blurb and action buttons in place and scrolls only the
         venue grid in between - same idea as the main app's sidebar,
         so the "Let's Play" button is never hunting-required to find. */
      .pp-intro.pp-intro-venue {
        align-items: stretch; padding: 16px 24px;
      }
      .pp-venue-content {
        max-width: 760px; width: 100%; margin: 0 auto; display: flex; flex-direction: column;
        align-items: center; gap: 12px; text-align: center; min-height: 0;
      }
      .pp-venue-header { flex-shrink: 0; }
      .pp-venue-grid-scroll {
        flex: 1; min-height: 0; overflow-y: auto; width: 100%;
        padding: 4px 2px;
      }
      .pp-venue-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px; width: 100%;
      }
      .pp-venue-card {
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        background: var(--panel); border: 3px solid var(--panel-border); border-radius: 8px;
        padding: 10px; cursor: pointer; text-align: center;
      }
      .pp-venue-card:hover { border-color: var(--text-dim); }
      .pp-venue-card.selected { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(255,209,102,0.35); }
      .pp-venue-card-locked { cursor: not-allowed; position: relative; }
      .pp-venue-card-locked:hover { border-color: var(--panel-border); }
      .pp-venue-card-locked .pp-venue-thumb { filter: brightness(0.5) grayscale(0.6); }
      .pp-venue-card-locked .pp-venue-name { color: var(--text-dim); }
      .pp-venue-thumb { width: 100%; aspect-ratio: 300 / 440; max-height: 160px; display: block; border-radius: 4px; }
      .pp-venue-name { font-weight: 800; font-size: 13px; color: var(--text); }
      .pp-venue-blurb { font-size: 11px; color: var(--text-dim); line-height: 1.4; }
      .pp-venue-actions { max-width: 320px; flex-shrink: 0; margin: 0 auto; width: 100%; }

      @media (max-height: 500px) {
        .pp-venue-thumb { max-height: 90px; }
        .pp-venue-blurb { display: none; }
        .pp-venue-content { gap: 6px; }
        .pp-venue-card { padding: 6px; gap: 3px; }
      }

      /* ── MAIN AREA (field + sidebar) ─────────────────────────────── */
      .pp-main {
        flex: 1;
        display: flex;
        overflow: hidden;
        min-height: 0;
      }
      .pp-field-col {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        overflow: hidden;
      }
      .pp-field-col svg {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
      .pp-sidebar {
        width: var(--sidebar-w);
        flex-shrink: 0;
        border-left: 3px solid var(--panel-border);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--panel);
      }
      .pp-sidebar-inner {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        min-height: 0;
      }
      .pp-sidebar-inner::-webkit-scrollbar { width: 4px; }
      .pp-sidebar-inner::-webkit-scrollbar-thumb { background: var(--panel-border); border-radius: 2px; }

      /* Sits below .pp-sidebar-inner, outside the scrollable area, so the
         primary action button (Next Question, etc.) is always on-screen
         and never requires scrolling to reach - even on short phones. */
      .pp-sidebar-footer {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        padding-top: 0;
      }

      /* On phone-width screens, the field/free-kick view and the question
         sidebar stack instead of sitting side by side - the sidebar (with
         the question text and buttons) goes on top, sized to its content,
         and the field is pushed below it and given the rest of the
         viewport so it reads as the main, much-larger element rather than
         a panel squeezed beside a fixed-width sidebar. */
      @media (max-width: 700px) {
        .pp-main {
          flex-direction: column;
        }
        .pp-sidebar {
          order: -1;
          width: 100%;
          max-height: 38%;
          border-left: none;
          border-bottom: 3px solid var(--panel-border);
        }
        .pp-field-col,
        .pp-fk-col {
          flex: 1;
          min-height: 0;
          padding: 6px;
        }
      }

      /* ── SHARED TYPOGRAPHY ───────────────────────────────────────── */
      .pp-pixel { font-family: 'Press Start 2P', monospace; }
      .pp-hint { font-size: 12px; color: var(--text-dim); line-height: 1.5; }
      .pp-question-prompt { font-size: 16px; color: var(--text); line-height: 1.55; }
      .pp-question-prompt b { color: var(--accent-2); }
      .pp-hint b { color: var(--accent-2); }
      .pp-label { font-family: 'Press Start 2P', monospace; font-size: 9px; color: var(--text-dim); letter-spacing: 1px; }

      /* ── SQUAD SIDEBAR ───────────────────────────────────────────── */
      .pp-squad-hdr { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
      .pp-progress { font-family: 'Press Start 2P', monospace; font-size: 9px; color: var(--text-dim); }
      .pp-progress strong { color: var(--accent); }

      .pp-lineup-list { display: flex; flex-direction: column; gap: 4px; }
      .pp-lineup-row { display: flex; align-items: center; gap: 8px; background: var(--panel-light); border-radius: 4px; padding: 4px 8px; }
      .pp-lineup-pos { font-family: 'Baloo 2', sans-serif; font-size: 11px; font-weight: 700; color: var(--accent); width: 82px; flex-shrink: 0; }
      .pp-lineup-name { font-weight: 800; font-size: 12px; }

      .pp-roster-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .pp-card {
        background: var(--panel-light); border: 2px solid var(--panel-border); border-radius: 6px;
        padding: 6px; display: flex; flex-direction: column; align-items: center; gap: 3px;
        cursor: pointer; text-align: center;
      }
      .pp-card:hover { border-color: var(--accent); }
      .pp-card.selected { border-color: var(--accent-2); box-shadow: 0 0 0 2px rgba(6,214,160,0.35); }
      .pp-card-badge {
        font-family: 'Press Start 2P', monospace; font-size: 7px; color: var(--bg);
        background: var(--accent-2); padding: 1px 5px; border-radius: 3px;
      }
      .pp-card-name { font-size: 11px; font-weight: 800; }
      .pp-card-tag { font-size: 9px; color: var(--text-dim); line-height: 1.3; }

      .pp-card-locked {
        position: relative; cursor: default; opacity: 0.85;
        background: rgba(255,255,255,0.02);
      }
      .pp-card-locked:hover { border-color: var(--panel-border); }
      .pp-card-locked svg { filter: brightness(0.6); }
      .pp-card-lock-icon {
        position: absolute; top: 4px; right: 5px; font-size: 13px;
        filter: drop-shadow(1px 1px 0 rgba(0,0,0,0.5));
      }
      .pp-card-name-locked { color: var(--text-dim); letter-spacing: 2px; }
      .pp-card-tag-locked { color: var(--text-dim); font-style: italic; }

      /* ── BUTTONS ─────────────────────────────────────────────────── */
      .pp-action-bar { display: flex; gap: 8px; flex-wrap: wrap; }
      .pp-btn {
        font-family: 'Press Start 2P', monospace; font-size: 9px;
        padding: 9px 11px; background: var(--bg); color: var(--text);
        border: 2px solid var(--panel-border); box-shadow: 2px 2px 0 rgba(0,0,0,0.35);
        cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;
      }
      .pp-btn:active:not(:disabled) { transform: translate(2px,2px); box-shadow: none; }
      .pp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .pp-btn.primary { background: var(--accent); color: var(--bg); border-color: #caa24f; }
      .pp-btn.primary:disabled { background: var(--panel-light); color: var(--text-dim); border-color: var(--panel-border); }
      .pp-btn.full { width: 100%; justify-content: center; }

      /* ── COACH SIDEBAR ───────────────────────────────────────────── */
      .pp-subtab-row { display: flex; gap: 6px; }
      .pp-subtab {
        flex: 1; font-family: 'Press Start 2P', monospace; font-size: 9px;
        padding: 8px 4px; background: var(--bg); color: var(--text-dim);
        border: 2px solid var(--panel-border); cursor: pointer; text-align: center;
      }
      .pp-subtab.active { color: var(--accent); border-color: var(--accent); }

      .pp-situation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .pp-sit-btn {
        font-family: 'Baloo 2', sans-serif; background: var(--bg); border: 2px solid var(--panel-border);
        border-radius: 5px; padding: 7px 8px; cursor: pointer; color: var(--text); text-align: left;
        display: flex; flex-direction: column; gap: 1px;
      }
      .pp-sit-btn .pp-sit-group { font-weight: 800; font-size: 11px; }
      .pp-sit-btn .pp-sit-side { font-size: 10px; color: var(--text-dim); }
      .pp-sit-btn .pp-sit-progress { font-family: 'Press Start 2P', monospace; font-size: 8px; color: var(--text-dim); margin-top: 2px; }
      .pp-sit-btn.active { border-color: var(--accent); }
      .pp-sit-btn.done .pp-sit-progress { color: var(--accent-2); }

      .pp-chip-row { display: flex; gap: 5px; flex-wrap: wrap; }
      .pp-chip {
        font-family: 'Press Start 2P', monospace; font-size: 9px;
        padding: 6px 9px; background: var(--bg); color: var(--text);
        border: 2px solid var(--panel-border); cursor: pointer;
      }
      .pp-chip.active { background: var(--accent); color: var(--bg); border-color: var(--accent); }
      .pp-chip.set:not(.active) { border-color: var(--accent-2); color: var(--accent-2); }

      .pp-text-input, .pp-textarea {
        width: 100%; font-family: 'Baloo 2', sans-serif; font-size: 13px;
        background: var(--bg); border: 2px solid var(--panel-border); border-radius: 4px;
        color: var(--text); padding: 8px; outline: none; resize: vertical;
      }
      .pp-text-input:focus, .pp-textarea:focus { border-color: var(--accent); }

      .pp-list { display: flex; flex-direction: column; gap: 5px; }
      .pp-list-row {
        display: flex; align-items: center; justify-content: space-between; gap: 6px;
        background: var(--bg); border-radius: 4px; padding: 5px 8px; font-size: 11px;
      }
      .pp-list-remove {
        background: none; border: none; color: #e63946; font-size: 16px; font-weight: 800;
        cursor: pointer; line-height: 1; padding: 0 2px;
      }
      .pp-qbank-item {
        width: 100%; display: flex; flex-direction: column; gap: 3px; text-align: left;
        background: var(--bg); border: 2px solid var(--panel-border); border-radius: 5px;
        padding: 8px; color: var(--text); cursor: pointer; font-family: 'Baloo 2', sans-serif;
      }
      .pp-qbank-item:hover { border-color: var(--accent); }
      .pp-qbank-term { font-size: 8px; color: var(--accent); font-family: 'Press Start 2P', monospace; }
      .pp-qbank-preview { font-size: 12px; line-height: 1.4; }
      .pp-qbank-meta { font-size: 10px; color: var(--text-dim); }

      /* ── MATCH SIDEBAR ───────────────────────────────────────────── */
      .pp-scoreboard { display: flex; align-items: center; justify-content: center; gap: 20px; }
      .pp-score-side { display: flex; flex-direction: column; align-items: center; gap: 3px; }
      .pp-score-label { font-size: 9px; color: var(--text-dim); }
      .pp-score-num { font-size: 28px; color: var(--accent); font-family: 'Press Start 2P', monospace; }
      .pp-streak { display: flex; gap: 5px; }
      .pp-streak-dot { width: 13px; height: 13px; border-radius: 50%; background: var(--panel-light); border: 2px solid var(--panel-border); display: inline-block; }
      .pp-streak-dot.on { background: var(--accent-2); border-color: var(--accent-2); box-shadow: 0 0 6px var(--accent-2); }

      .pp-clock { display: flex; flex-direction: column; gap: 4px; }
      .pp-clock-bar { width: 100%; height: 7px; background: var(--bg); border: 2px solid var(--panel-border); border-radius: 4px; overflow: hidden; }
      .pp-clock-fill { height: 100%; background: var(--accent-2); transition: width 0.3s ease; }
      .pp-clock-fill.full { background: #e63946; }
      .pp-clock-label { font-size: 9px; color: var(--text-dim); letter-spacing: 1px; text-align: center; font-family: 'Press Start 2P', monospace; }

      .pp-result-panel {
        background: var(--panel-light); border: 2px solid var(--panel-border); border-radius: 6px;
        padding: 14px; display: flex; flex-direction: column; gap: 10px; align-items: center; text-align: center;
        position: relative;
      }
      .pp-result-panel h2 { font-size: 14px; margin: 0; }
      .pp-result-panel p { font-size: 12px; line-height: 1.5; color: var(--text-dim); margin: 0; }
      .pp-correct { color: var(--accent-2); }
      .pp-incorrect { color: #e63946; }
      .pp-opponent-score { color: #e63946; font-weight: 800; font-size: 12px; }

      .pp-final-score { font-size: 28px; color: var(--accent); font-family: 'Press Start 2P', monospace; }
      .pp-unlock-banner {
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        padding: 14px; margin: 4px 0; border-radius: 8px;
        background: rgba(255,209,102,0.12); border: 2px dashed var(--accent);
      }
      .pp-unlock-title { font-size: 13px; color: var(--accent); text-shadow: 2px 2px 0 rgba(0,0,0,0.35); }
      .pp-unlock-name { font-weight: 800; font-size: 14px; color: var(--text); margin: 0; }
      .pp-unlock-tag { font-size: 11px; color: var(--text-dim); margin: 0; text-align: center; }
      .pp-celebration { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
      @keyframes pp-dance {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      .pp-dance-arm { animation: pp-dance 0.5s ease-in-out infinite; }

      .pp-confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 5; }
      .pp-confetti-piece {
        position: absolute; top: -12px; opacity: 0.9; border-radius: 2px;
        animation-name: pp-confetti-fall; animation-timing-function: linear; animation-iteration-count: infinite;
      }
      @keyframes pp-confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
      }

      .pp-fireworks { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 5; }
      .pp-firework-burst { position: absolute; width: 4px; height: 4px; }
      .pp-firework-spark {
        position: absolute; top: 0; left: 0; width: 4px; height: 4px; border-radius: 50%;
        animation-name: pp-firework-pop; animation-duration: 1.1s; animation-timing-function: ease-out;
        animation-iteration-count: infinite; opacity: 0;
      }
      @keyframes pp-firework-pop {
        0% { transform: rotate(var(--rot, 0deg)) translateX(0) scale(1); opacity: 0; }
        15% { opacity: 1; }
        100% { transform: rotate(var(--rot, 0deg)) translateX(46px) scale(0.4); opacity: 0; }
      }

      /* ── FIELD SVG ───────────────────────────────────────────────── */
      .pp-slot { cursor: pointer; }
      .pp-slot:hover { transform: scale(1.06); transform-box: fill-box; transform-origin: center; }
      .pp-slot-label {
        font-family: 'Press Start 2P', monospace; font-size: 11px; fill: var(--text);
        text-anchor: middle; dominant-baseline: middle;
        paint-order: stroke; stroke: rgba(0,0,0,0.55); stroke-width: 3px;
      }
      .pp-coach-field { cursor: crosshair; }
      .pp-coach-label {
        font-family: 'Press Start 2P', monospace; font-size: 8px; fill: var(--bg);
        text-anchor: middle; dominant-baseline: middle;
      }
      .pp-context-label {
        font-family: 'Baloo 2', sans-serif; font-size: 10px; fill: #ffffff; text-anchor: middle;
        paint-order: stroke; stroke: rgba(0,0,0,0.6); stroke-width: 3px;
      }
      .pp-fk-zone { cursor: pointer; }
      .pp-fk-zone:hover { fill: rgba(255,255,255,0.08); }

      /* ── FREEKICK REPLACES FIELD ─────────────────────────────────── */
      .pp-fk-col {
        flex: 1; min-width: 0; display: flex; flex-direction: column;
        align-items: center; justify-content: center; padding: 10px; gap: 12px;
      }
      .pp-fk-col svg { width: 100%; max-height: 100%; display: block; }

      /* ── DIVIDER ─────────────────────────────────────────────────── */
      .pp-divider { border: none; border-top: 2px solid var(--panel-border); margin: 2px 0; }

      /* ── COACH / QUESTIONS: empty state when nothing is being edited ── */
      .pp-field-empty-state {
        display: flex; align-items: center; justify-content: center;
        height: 100%; width: 100%; max-width: 420px; padding: 24px;
      }

      /* ── EXTREME MODE ─────────────────────────────────────────────── */
      .pp-xm-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px; padding-bottom: 4px; border-bottom: 2px dashed rgba(230,57,70,0.4);
      }
      .pp-xm-summary { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
      .pp-xm-lives { font-size: 10px; color: var(--text-dim); letter-spacing: 0.5px; line-height: 1.8; }
      .pp-xm-life { font-size: 13px; filter: grayscale(0) opacity(1); margin-left: 2px; }
      .pp-xm-life.used { filter: grayscale(1) opacity(0.25); }

      /* ── CHAMPION SCREEN ─────────────────────────────────────────── */
      .pp-champion {
        position: relative; width: 100%; height: 100%; display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 14px; padding: 24px; overflow: auto;
        background: radial-gradient(ellipse at center, rgba(255,209,102,0.12), transparent 70%);
      }
      .pp-champion-title {
        font-size: 30px; line-height: 1.3; text-align: center; color: var(--accent);
        text-shadow: 4px 4px 0 rgba(0,0,0,0.4); position: relative; z-index: 6;
      }
      .pp-champion-sub { font-size: 13px; color: var(--text); font-weight: 700; position: relative; z-index: 6; }
      .pp-champion-squad { position: relative; z-index: 6; max-width: 480px; }
      .pp-champion-actions { max-width: 320px; position: relative; z-index: 6; }
      @media (max-height: 560px) {
        .pp-champion-title { font-size: 20px; }
        .pp-champion { gap: 8px; }
      }
    `}</style>
  );
}
