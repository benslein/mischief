import { BASE_SHAPES, FIXED, JERSEY_OPTIONS, SHORTS_OPTIONS, DEFAULT_JERSEY_ID, DEFAULT_SHORTS_ID } from '../data/gameData.js';

export function mirrorRow(row) {
  return row + row.split('').reverse().join('');
}

// eyeRow/mouthRow optionally override row 5 (eyes) and row 7 (mouth) before
// mirroring, letting any head shape carry any expression.
export function buildGrid(shape, eyeRow, mouthRow) {
  const base = BASE_SHAPES[shape].slice();
  if (eyeRow) base[5] = eyeRow;
  if (mouthRow) base[7] = mouthRow;
  return base.map(mirrorRow);
}

// Returns an array of <rect> elements for a character. Usable directly
// inside any <svg> or <g> (e.g. a standalone card, or placed on the field).
export function getSpriteRects(shape, colors, eyeRow, mouthRow) {
  const grid = buildGrid(shape, eyeRow, mouthRow);
  const palette = { ...FIXED, ...colors };
  const rects = [];
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const key = row[x];
      const color = palette[key];
      if (!color || key === '.') continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />);
    }
  });
  return rects;
}

function PixelSprite({ shape, colors, eyeRow, mouthRow, size = 80 }) {
  return (
    <svg viewBox="0 0 12 16" width={size} height={(size * 16) / 12} shapeRendering="crispEdges">
      {getSpriteRects(shape, colors, eyeRow, mouthRow)}
    </svg>
  );
}

// Builds a {J, C, P} kit object from the Kit Select screen's jersey/shorts
// picks. Trim always contrasts with the jersey (red jersey -> white trim,
// white jersey -> red trim) so every combination still looks like a real
// uniform rather than a clash.
export function buildTeamKit(jerseyId = DEFAULT_JERSEY_ID, shortsId = DEFAULT_SHORTS_ID) {
  const jersey = JERSEY_OPTIONS.find((j) => j.id === jerseyId) || JERSEY_OPTIONS[0];
  const shorts = SHORTS_OPTIONS.find((s) => s.id === shortsId) || SHORTS_OPTIONS[0];
  const trim = jersey.color === '#ffffff' ? '#e63946' : '#ffffff';
  return { J: jersey.color, C: trim, P: shorts.color };
}

// Default kit (red top, white shorts) used wherever a caller doesn't pass
// its own selected kit. Hair, skin, and accessories stay per-character so
// players are still recognizable; only the kit colors are overridden.
const DEFAULT_TEAM_KIT = buildTeamKit();
export function kitColors(colors, kit = DEFAULT_TEAM_KIT) {
  return { ...colors, ...kit };
}

// Blue "other team" kit for friendly/celebratory scenes (e.g. the intro
// screen's dancing rows) where a single fixed angry opponent face would
// look out of place - this keeps each character's own hairstyle and
// expression, only the jersey/shorts/cleats turn blue.
const AWAY_KIT = { J: '#1d3557', C: '#ffffff', P: '#1d3557' };
export function awayKitColors(colors) {
  return { ...colors, ...AWAY_KIT };
}

// Head-only crop (top HEAD_ROWS rows of the 16-row sprite) for squad-select
// cards, rendered larger so hairstyle/face details are easier to see.
const HEAD_ROWS = 10;
function getHeadRects(shape, colors, eyeRow, mouthRow) {
  const grid = buildGrid(shape, eyeRow, mouthRow).slice(0, HEAD_ROWS);
  const palette = { ...FIXED, ...colors };
  const rects = [];
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const key = row[x];
      const color = palette[key];
      if (!color || key === '.') continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />);
    }
  });
  return rects;
}
function PixelHead({ shape, colors, eyeRow, mouthRow, size = 96 }) {
  return (
    <svg viewBox={`0 0 12 ${HEAD_ROWS}`} width={size} height={(size * HEAD_ROWS) / 12} shapeRendering="crispEdges">
      {getHeadRects(shape, colors, eyeRow, mouthRow)}
    </svg>
  );
}

// Small pixel soccer ball - used as a header icon and as the ball marker in Coach Mode.
const BALL_GRID = [
  '.WWWWWW.', 'WWWKKWWW', 'WKWWWWKW', 'WKWKKWKW',
  'WKWKKWKW', 'WKWWWWKW', 'WWWKKWWW', '.WWWWWW.',
];
const BALL_PALETTE = { '.': null, W: '#f1f1f1', K: '#262335' };
export function getBallRects() {
  const rects = [];
  BALL_GRID.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const key = row[x];
      const color = BALL_PALETTE[key];
      if (!color) continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />);
    }
  });
  return rects;
}
function PixelBall({ size = 32 }) {
  return <svg viewBox="0 0 8 8" width={size} height={size} shapeRendering="crispEdges">{getBallRects()}</svg>;
}

export { PixelSprite, PixelHead, PixelBall };
