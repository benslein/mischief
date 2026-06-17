import { ALL_SLOTS, FORMATION_2_3_1, ROLE_COLOR, SITUATIONS, findPlayer, EYE_ANGRY, MOUTH_SCOWL, OPPONENT_SHAPE, OPPONENT_COLORS } from '../data/gameData.js';
import { getBallRects, getSpriteRects, kitColors } from './sprites.jsx';

// Converts a click event on a field SVG (sized via CSS object-fit: contain,
// which can letterbox if the element's box doesn't match the viewBox aspect
// ratio) into a percentage position within the SVG's own coordinate space.
// Using getBoundingClientRect() directly here would be wrong whenever the
// element's box is wider/taller than the letterboxed content, since clicks
// in the letterbox gutter would otherwise get mapped as if they were on the
// pitch - this clamps to the visible content rect first.
export function fieldClickToPercent(e, viewboxW, viewboxH) {
  const rect = e.currentTarget.getBoundingClientRect();
  const boxAspect = rect.width / rect.height;
  const contentAspect = viewboxW / viewboxH;

  let contentW = rect.width;
  let contentH = rect.height;
  let offsetX = 0;
  let offsetY = 0;

  if (boxAspect > contentAspect) {
    // Box is wider than content - letterboxed left/right.
    contentW = rect.height * contentAspect;
    offsetX = (rect.width - contentW) / 2;
  } else if (boxAspect < contentAspect) {
    // Box is taller than content - letterboxed top/bottom.
    contentH = rect.width / contentAspect;
    offsetY = (rect.height - contentH) / 2;
  }

  const x = ((e.clientX - rect.left - offsetX) / contentW) * 100;
  const y = ((e.clientY - rect.top - offsetY) / contentH) * 100;
  return { x, y };
}

export function checkAnswer(question, tap) {
  if (question.type === 'position') {
    const dx = Math.abs(tap.x - question.target.x);
    const dy = Math.abs(tap.y - question.target.y);
    return dx <= 18 && dy <= 13;
  }
  return question.zones.some((z) => tap.x >= z.xMin && tap.x <= z.xMax && tap.y >= z.yMin && tap.y <= z.yMax);
}

export function generatePositionQuestion(assignments, positionData) {
  const situation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
  const slot = FORMATION_2_3_1[Math.floor(Math.random() * FORMATION_2_3_1.length)];
  const overrides = positionData[situation.id] || {};
  const target = overrides[slot.id] || { x: slot.x, y: slot.y };

  const player = findPlayer(assignments[slot.id]);
  const subject = player ? `${player.name} (${slot.full})` : `your ${slot.full}`;

  // Everyone else lines up in their correct spot for this situation, so the
  // kid only has to work out the one position being asked about.
  const context = ALL_SLOTS.filter((s) => s.id !== slot.id).map((s) => {
    const pos = overrides[s.id] || { x: s.x, y: s.y };
    if (s.id === 'ball') {
      return { x: pos.x, y: pos.y, render: 'ball', label: 'Ball' };
    }
    const player = findPlayer(assignments[s.id]);
    if (player) {
      return { x: pos.x, y: pos.y, render: 'player', shape: player.shape, colors: player.colors, eyeRow: player.eyeRow, mouthRow: player.mouthRow, label: s.label };
    }
    return { x: pos.x, y: pos.y, render: 'role', color: ROLE_COLOR[s.id], label: s.label };
  });

  return {
    type: 'position',
    key: `pos-${situation.id}-${slot.id}`,
    prompt: `${situation.group} — ${situation.side}: where should ${subject} be?`,
    target,
    context,
  };
}

export function generateQuestion(assignments, positionData, questionBank) {
  const validBank = (questionBank || []).filter((q) => q.prompt && q.zones && q.zones.length > 0);
  if (Math.random() < 0.6 || validBank.length === 0) return generatePositionQuestion(assignments, positionData);
  const t = validBank[Math.floor(Math.random() * validBank.length)];
  return {
    type: 'terminology',
    key: `term-${t.id}`,
    prompt: t.prompt,
    term: t.term,
    zones: t.zones,
    context: t.context || [],
  };
}

export function renderContextMarker(marker, key, teamKit) {
  const W = 300, H = 440;
  const px = (marker.x / 100) * W;
  const py = (marker.y / 100) * H;

  // Ball/player/attacker/defender markers render a recognizable sprite on
  // their own, so a floating "Ball" / "Teammate" / "OTHER TEAM" caption
  // above them is redundant clutter rather than useful information - these
  // four types intentionally don't draw marker.label at all. The 'role'
  // dot below is the one exception: its short text (e.g. "GK") is the
  // marker's only content, so that one still renders its label.
  if (marker.render === 'ball') {
    const scale = 2.5;
    return (
      <g key={key}>
        <g transform={`translate(${px - 4 * scale} ${py - 4 * scale}) scale(${scale})`}>{getBallRects()}</g>
      </g>
    );
  }

  if (marker.render === 'player') {
    const scale = 2.0;
    return (
      <g key={key}>
        <ellipse cx={px} cy={py + 10} rx="14" ry="5" fill="rgba(0,0,0,0.25)" />
        <g transform={`translate(${px - 6 * scale} ${py - 8 * scale}) scale(${scale})`}>{getSpriteRects(marker.shape, kitColors(marker.colors, teamKit), marker.eyeRow, marker.mouthRow)}</g>
      </g>
    );
  }

  if (marker.render === 'attacker' || marker.render === 'defender') {
    const scale = 2.0;
    return (
      <g key={key}>
        <ellipse cx={px} cy={py + 10} rx="14" ry="5" fill="rgba(0,0,0,0.25)" />
        <g transform={`translate(${px - 6 * scale} ${py - 8 * scale}) scale(${scale})`}>{getSpriteRects(OPPONENT_SHAPE, OPPONENT_COLORS, EYE_ANGRY, MOUTH_SCOWL)}</g>
      </g>
    );
  }

  // 'role' (unassigned teammate) - colored dot with a short label
  const color = marker.color || 'var(--panel-light)';
  return (
    <g key={key}>
      <circle cx={px} cy={py} r="12" fill={color} stroke="var(--bg)" strokeWidth="2" />
      <text x={px} y={py + 1} className="pp-coach-label">{marker.label || ''}</text>
    </g>
  );
}
