import React, { useState, useEffect, useRef } from 'react';
import { Shuffle, RotateCcw, Upload, Download } from 'lucide-react';

/* =========================================================================
   PIXEL SPRITE SYSTEM
   - Each character shape is defined as a LEFT HALF (6 cols x 16 rows) and
     mirrored to a full 12x16 grid, so every sprite is symmetric by design.
   - Palette keys: . transparent | K outline | H hair | S skin | B eye
                   M mouth | J jersey | C jersey trim | P shorts | N accessory
   - K, B, M are fixed across all characters; H/S/J/C/P/N vary per character.
   ========================================================================= */

const BASE_SHAPES = {
  pigtails: [
    '..KKKK', '.KHHHH', 'KHHHHH', 'KHHSSS', 'HHSSSS', 'HKSBSS',
    'HHSSSS', 'KSSSMM', 'KSSSSS', '.KSSSS', '..KKKK', '.KJJJJ',
    'KJCJJJ', 'KJJJJJ', '.KPPPP', '.KP..K',
  ],
  long_hair: [
    '..KKKK', '.KHHHH', 'KHHHHH', 'KHHSSS', 'KHSSSS', 'HSSBSS',
    'HSSSSS', 'HSSSMM', 'HSSSSS', 'HHSSSS', 'H.KKKK', 'H.JJJJ',
    'HJCJJJ', 'HJJJJJ', '.KPPPP', '.KP..K',
  ],
  twin_buns: [
    '.HHHKK', 'HHHHHH', 'KHHHHH', 'KHHSSS', 'KHSSSS', 'KSSBSS',
    'KSSSSS', 'KSSSMM', 'KSSSSS', '.KSSSS', '..KKKK', '.KJJJJ',
    'KJCJJJ', 'KJJJJJ', '.KPPPP', '.KP..K',
  ],
  headband_long: [
    '..KKKK', '.KHHHH', 'KHHHHH', 'KNNNNN', 'KSSSSS', 'HSSBSS',
    'HSSSSS', 'HSSSMM', 'HSSSSS', 'HHSSSS', 'H.KKKK', 'H.JJJJ',
    'HJCJJJ', 'HJJJJJ', '.KPPPP', '.KP..K',
  ],
  shades_long: [
    '..KKKK', '.KHHHH', 'KHHHHH', 'KHHSSS', 'KHSSSS', 'KSNNNN',
    'HSSSSS', 'HSSSMM', 'HSSSSS', 'HHSSSS', 'H.KKKK', 'H.JJJJ',
    'HJCJJJ', 'HJJJJJ', '.KPPPP', '.KP..K',
  ],
  afro: [
    'HHHHHH', 'HHHHHH', 'HHHHHH', 'KHHSSS', 'KHSSSS', 'KSSBSS',
    'KSSSSS', 'KSSSMM', 'KSSSSS', '.KSSSS', '..KKKK', '.KJJJJ',
    'KJCJJJ', 'KJJJJJ', '.KPPPP', '.KP..K',
  ],
  bandana: [
    '..NNNN', '.NNNNN', 'NNNNNN', 'NNNSSS', 'NSSSSS', 'KSSBSS',
    'KSSSSS', 'KSSSMM', 'KSSSSS', 'HHSSSS', '..KKKK', '.KJJJJ',
    'KJCJJJ', 'KJJJJJ', '.KPPPP', '.KP..K',
  ],
  cap_visor: [
    '..NNNN', '.NNNNN', 'NNNNNN', 'NNNNNN', 'KSSSSS', 'KSSBSS',
    'KSSSSS', 'KSSSMM', 'KSSSSS', 'HHSSSS', '..KKKK', '.KJJJJ',
    'KJCJJJ', 'KJJJJJ', '.KPPPP', '.KP..K',
  ],
  curly: [
    '.H.HKK', 'HHHHHH', 'KHHHHH', 'KHHSSS', 'KHSSSS', 'KSSBSS',
    'KSSSSS', 'KSSSMM', 'KSSSSS', '.KSSSS', '..KKKK', '.KJJJJ',
    'KJCJJJ', 'KJJJJJ', '.KPPPP', '.KP..K',
  ],
  high_ponytail: [
    '...HHH', '..HHHH', '.KHHHH', 'KHHSSS', 'KHSSSS', 'KSSBSS',
    'KSSSSS', 'KSSSMM', 'KSSSSS', '.KSSSS', '..KKKK', '.KJJJJ',
    'KJCJJJ', 'KJJJJJ', '.KPPPP', '.KP..K',
  ],
};

// Expression variants - swapped into row 5 (eyes) and/or row 7 (mouth) of
// any head shape via buildGrid's eyeRow/mouthRow params. Omitted = the
// shape's own default (small dot eyes, flat mouth).
const EYE_BIG = 'KSBBSS';
const MOUTH_GRIN = 'KSSWWM';
const MOUTH_SMALL = 'KSSSSM';
const EYE_ANGRY = 'KKBBSS';
const MOUTH_SCOWL = 'KSMMMM';

// Opposing team - rendered with the same sprite system, in a blue kit with
// an angry expression, instead of a plain colored dot.
const OPPONENT_SHAPE = 'cap_visor';
const OPPONENT_COLORS = { H: '#3a1f1f', S: '#c98a5e', N: '#1d3557', J: '#1d3557', C: '#457b9d', P: '#1d3557' };

const FIXED = { K: '#262335', B: '#1a1a2e', M: '#3a1f1f', W: '#ffffff' };

function mirrorRow(row) {
  return row + row.split('').reverse().join('');
}

// eyeRow/mouthRow optionally override row 5 (eyes) and row 7 (mouth) before
// mirroring, letting any head shape carry any expression.
function buildGrid(shape, eyeRow, mouthRow) {
  const base = BASE_SHAPES[shape].slice();
  if (eyeRow) base[5] = eyeRow;
  if (mouthRow) base[7] = mouthRow;
  return base.map(mirrorRow);
}

// Returns an array of <rect> elements for a character. Usable directly
// inside any <svg> or <g> (e.g. a standalone card, or placed on the field).
function getSpriteRects(shape, colors, eyeRow, mouthRow) {
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

// Unified team kit shown on the field/Match Day - red jersey, white trim and
// shorts. Hair, skin, and accessories stay per-character so players are
// still recognizable; only the kit colors are overridden.
const TEAM_KIT = { J: '#e63946', C: '#ffffff', P: '#ffffff' };
function kitColors(colors) {
  return { ...colors, ...TEAM_KIT };
}

// Blue "other team" kit for friendly/celebratory scenes (e.g. the intro
// screen's dancing rows) where a single fixed angry opponent face would
// look out of place - this keeps each character's own hairstyle and
// expression, only the jersey/shorts/cleats turn blue.
const AWAY_KIT = { J: '#1d3557', C: '#ffffff', P: '#1d3557' };
function awayKitColors(colors) {
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
function getBallRects() {
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

/* =========================================================================
   ROSTER DATA
   12 characters to choose from. `id` must stay unique and stable -
   Coach Mode and the quiz engine will reference players by this id.
   ========================================================================= */

const ROSTER = [
  { id: 'rocket', name: 'Rocket Ramirez', shape: 'pigtails', eyeRow: EYE_BIG, mouthRow: MOUTH_GRIN,
    colors: { H: '#3a2e2e', S: '#d9a066' },
    tag: 'Runs so fast her cleats leave smoke.' },
  { id: 'tiny', name: 'Tiny Torres', shape: 'headband_long',
    colors: { H: '#6b4423', N: '#e63946', S: '#f4c89e' },
    tag: 'Smallest player, biggest tackles.' },
  { id: 'sam', name: "Slammin' Sam", shape: 'afro', mouthRow: MOUTH_GRIN,
    colors: { H: '#c1502e', S: '#a9714f' },
    tag: 'Shoots so hard the net needs a nap.' },
  { id: 'penny', name: 'Professor Penny', shape: 'shades_long', mouthRow: MOUTH_SMALL,
    colors: { H: '#8b5fbf', N: '#a8dadc', S: '#f4c89e' },
    tag: 'Always finds the open player.' },
  { id: 'cleo', name: 'Captain Cleo', shape: 'twin_buns',
    colors: { H: '#e8c170', S: '#8d5524' },
    tag: 'Born to wear the armband.' },
  { id: 'sadie', name: 'Sleepy Sadie', shape: 'long_hair', mouthRow: MOUTH_SMALL,
    colors: { H: '#1f1b24', S: '#d9a066' },
    tag: 'Looks half-asleep. Always in the right spot.' },
  { id: 'greta', name: 'Glue Greta', shape: 'bandana', eyeRow: EYE_BIG,
    colors: { H: '#6b4423', N: '#e63946', S: '#f4c89e' },
    tag: "Once the ball's near Greta, it stays near Greta." },
  { id: 'ziggy', name: 'Ziggy Zee', shape: 'cap_visor', eyeRow: EYE_BIG, mouthRow: MOUTH_GRIN,
    colors: { H: '#3a2e2e', N: '#5a9b5a', S: '#a9714f' },
    tag: "Runs in directions that don't exist yet." },
  { id: 'bree', name: 'Bulldozer Bree', shape: 'curly',
    colors: { H: '#48cae4', S: '#a9714f' },
    tag: 'Goes through, not around.' },
  { id: 'lou', name: 'Lefty Lou', shape: 'high_ponytail', mouthRow: MOUTH_GRIN,
    colors: { H: '#ff70a6', S: '#f4c89e' },
    tag: 'Everything bends to the left.' },
  { id: 'nora', name: 'Newbie Nora', shape: 'long_hair', eyeRow: EYE_BIG, mouthRow: MOUTH_SMALL,
    colors: { H: '#2ec4b6', S: '#d9a066' },
    tag: 'First practice. Already lost a cleat.' },
  { id: 'skylar', name: 'Spark Skylar', shape: 'shades_long', mouthRow: MOUTH_GRIN,
    colors: { H: '#ffd166', N: '#a8dadc', S: '#8d5524' },
    tag: 'Plays at 200% energy, including snack break.' },
];

// Players unlocked one at a time for each match win (up to 8 total), in a
// fixed order so unlocking feels like steady progress rather than a random
// re-roll of the same pool. Once unlocked they're added to ROSTER_ALL and
// behave exactly like any other bench player - same shapes as the base
// roster (it's a small set, all 10 are already in use), but with fresh
// colors/expressions so each one still reads as a distinct new face.
const UNLOCKABLE_ROSTER = [
  { id: 'turbo', name: 'Turbo Tomás', shape: 'afro', eyeRow: EYE_BIG,
    colors: { H: '#e63946', S: '#8d5524' },
    tag: 'Top speed: yes. Brakes: still installing.' },
  { id: 'comet', name: 'Comet Carmen', shape: 'high_ponytail', mouthRow: MOUTH_SMALL,
    colors: { H: '#06d6a0', S: '#a9714f' },
    tag: 'Leaves a glow-in-the-dark trail. Probably.' },
  { id: 'juju', name: 'Juke Juju', shape: 'curly', eyeRow: EYE_BIG, mouthRow: MOUTH_GRIN,
    colors: { H: '#ffd166', S: '#f4c89e' },
    tag: 'Fakes left, fakes right, fakes a third direction.' },
  { id: 'blaze', name: 'Blaze Bailey', shape: 'cap_visor', mouthRow: MOUTH_GRIN,
    colors: { H: '#1f1b24', N: '#e63946', S: '#d9a066' },
    tag: 'Scored from the parking lot once. Allegedly.' },
  { id: 'misty', name: 'Misty Moreno', shape: 'twin_buns', eyeRow: EYE_BIG,
    colors: { H: '#48cae4', S: '#f4c89e' },
    tag: 'Disappears in fog, reappears with the ball.' },
  { id: 'gizmo', name: 'Gizmo Diaz', shape: 'bandana', mouthRow: MOUTH_SMALL,
    colors: { H: '#2ec4b6', N: '#ffd166', S: '#a9714f' },
    tag: 'Built a cleat-cleaning robot. It also juggles.' },
  { id: 'echo', name: 'Echo Owusu', shape: 'pigtails', eyeRow: EYE_BIG, mouthRow: MOUTH_GRIN,
    colors: { H: '#9d4edd', S: '#d9a066' },
    tag: 'Calls the same play twice. Works both times.' },
  { id: 'ranger', name: 'Ranger Reyes', shape: 'headband_long', mouthRow: MOUTH_GRIN,
    colors: { H: '#2b9348', N: '#ffd166', S: '#f4c89e' },
    tag: 'Patrols the whole field. Off the clock too.' },
];

// Looks up a player by id across BOTH the base roster and the unlockable
// pool, since once a player is unlocked and assigned to a slot, every
// screen that renders "whoever is in this slot" needs to find them the
// same way regardless of which pool they originally came from.
function findPlayer(id) {
  return ROSTER.find((p) => p.id === id) || UNLOCKABLE_ROSTER.find((p) => p.id === id);
}

/* =========================================================================
   FORMATION DATA
   2-3-1 for 7v7 (GK + 2 DEF + 3 MID + 1 FWD). x/y are % of field width/height,
   field assumed to attack TOWARD y=0 (top) and defend y=100 (bottom).
   This is also the BASE/DEFAULT formation shown faintly in Coach Mode, and
   the fallback position for any situation that hasn't been customized yet.
   ========================================================================= */

const FORMATION_2_3_1 = [
  { id: 'gk', label: 'GK', full: 'Goalkeeper', x: 50, y: 92 },
  { id: 'lb', label: 'LB', full: 'Left Back', x: 26, y: 70 },
  { id: 'rb', label: 'RB', full: 'Right Back', x: 74, y: 70 },
  { id: 'lm', label: 'LM', full: 'Left Mid', x: 16, y: 44 },
  { id: 'cm', label: 'CM', full: 'Center Mid', x: 50, y: 44 },
  { id: 'rm', label: 'RM', full: 'Right Mid', x: 84, y: 44 },
  { id: 'st', label: 'ST', full: 'Striker', x: 50, y: 13 },
];

const BALL_SLOT = { id: 'ball', label: 'BALL', full: 'the ball', x: 50, y: 50 };
const ALL_SLOTS = [BALL_SLOT, ...FORMATION_2_3_1];
const SLOT_ORDER = ALL_SLOTS.map((s) => s.id);

const ROLE_COLOR = {
  gk: '#ffd166', lb: '#48cae4', rb: '#48cae4',
  lm: '#06d6a0', cm: '#06d6a0', rm: '#06d6a0', st: '#e63946',
};

/* =========================================================================
   COACH MODE - SITUATIONS
   8 starter "restarts" (the standard set pieces in youth soccer rules),
   each as Attack (your team takes it) or Defend (opponent takes it).
   positionData[situationId][slotId] = { x, y } once the coach sets it;
   falls back to FORMATION_2_3_1 until then. This is the data Match Day's
   position questions will read from ("move LB into position for...").
   ========================================================================= */

const SITUATIONS = [
  { id: 'kickoff_atk', group: 'Kickoff', side: 'Attack' },
  { id: 'kickoff_def', group: 'Kickoff', side: 'Defend' },
  { id: 'goalkick_atk', group: 'Goal Kick', side: 'Attack' },
  { id: 'goalkick_def', group: 'Goal Kick', side: 'Defend' },
  { id: 'throwin_atk', group: 'Throw-In', side: 'Attack' },
  { id: 'throwin_def', group: 'Throw-In', side: 'Defend' },
  { id: 'corner_atk', group: 'Corner Kick', side: 'Attack' },
  { id: 'corner_def', group: 'Corner Kick', side: 'Defend' },
];

/* =========================================================================
   MATCH DAY - TERMINOLOGY QUESTIONS
   Field-tap questions (not multiple choice). Each has a fixed "context"
   scenario to draw on the field, and one or more correct "zones" (percent
   rectangles). Direction convention matches FORMATION_2_3_1: attacking goal
   is toward y=0 (top), own goal is toward y=100 (bottom).
   ========================================================================= */

const TERMINOLOGY_QUESTIONS = [
  {
    id: 'drop',
    term: 'Drop',
    prompt: "Your teammate (ball) needs a safe pass. 'Drop' means making a run backward - away from the goal you're attacking - to support them. Tap a good drop spot.",
    context: [{ x: 50, y: 45, render: 'ball', label: 'Has the ball' }],
    zones: [{ xMin: 30, xMax: 70, yMin: 58, yMax: 78 }],
  },
  {
    id: 'wide',
    term: 'Wide',
    prompt: "'Wide' means spreading out near the sideline to make the field bigger for your team. Tap a wide position.",
    context: [{ x: 50, y: 50, render: 'ball', label: 'Ball in the middle' }],
    zones: [
      { xMin: 4, xMax: 18, yMin: 20, yMax: 80 },
      { xMin: 82, xMax: 96, yMin: 20, yMax: 80 },
    ],
  },
  {
    id: 'through',
    term: 'Through Ball',
    prompt: "A 'through ball' is played into open space behind the defenders, toward the goal you're attacking (top). The two markers are defenders. Tap the space for a through ball.",
    context: [
      { x: 35, y: 32, render: 'defender', label: 'DEF' },
      { x: 65, y: 32, render: 'defender', label: 'DEF' },
    ],
    zones: [{ xMin: 38, xMax: 62, yMin: 10, yMax: 28 }],
  },
  {
    id: 'goalside',
    term: 'Goal Side',
    prompt: "Being 'goal side' means standing between an attacker and the goal you're defending (bottom). Tap the spot that is goal side of the blue attacker.",
    context: [{ x: 60, y: 72, render: 'attacker', label: 'ATT' }],
    zones: [{ xMin: 50, xMax: 70, yMin: 78, yMax: 95 }],
  },
  {
    id: 'buildout',
    term: 'Build-Out Line',
    prompt: "It's your goal kick (ball near your own goal, bottom). Opponents must stay behind the dashed build-out line until you play the ball. Tap the area where they have to wait.",
    context: [{ x: 50, y: 88, render: 'ball', label: 'Goal kick' }],
    zones: [{ xMin: 8, xMax: 92, yMin: 6, yMax: 63 }],
  },
];

// Default coach data - set positions and question bank a coach has tuned,
// shipped as the app's built-in defaults. A coach's own saved data (in
// browser storage) or an imported file still takes precedence once it
// exists; this is only what a brand-new install starts from.
const DEFAULT_POSITION_DATA = {
  "kickoff_atk": {
    "gk": {
      "x": 49.55079122001022,
      "y": 91.88361408882083
    },
    "lb": {
      "x": 37.19754977029097,
      "y": 77.7947932618683
    },
    "rb": {
      "x": 61.45482388973967,
      "y": 79.47932618683001
    },
    "lm": {
      "x": 16.533945890760595,
      "y": 52.833078101071976
    },
    "cm": {
      "x": 49.55079122001022,
      "y": 60.949464012251156
    },
    "rm": {
      "x": 86.16130678917816,
      "y": 52.37366003062787
    },
    "st": {
      "x": 48.203164880040845,
      "y": 51.91424196018377
    }
  },
  "goalkick_atk": {
    "gk": {
      "x": 50.000000000000014,
      "y": 94.33384379785605
    },
    "lb": {
      "x": 22.14905564063298,
      "y": 93.72128637059724
    },
    "rb": {
      "x": 78.52475752935172,
      "y": 94.02756508422665
    },
    "lm": {
      "x": 3.9561000510464552,
      "y": 72.74119448698315
    },
    "cm": {
      "x": 50.89841755997959,
      "y": 79.93874425727412
    },
    "rm": {
      "x": 95.59469116896376,
      "y": 74.27258805513017
    },
    "st": {
      "x": 50.224604389994894,
      "y": 54.36447166921899
    },
    "ball": {
      "x": 49.77539561000511,
      "y": 90.6584992343032
    }
  },
  "throwin_atk": {
    "ball": {
      "x": 3.057682491066873,
      "y": 51.76110260336907
    },
    "gk": {
      "x": 41.465033180193984,
      "y": 91.57733537519142
    },
    "lb": {
      "x": 8.448187850944363,
      "y": 66.6156202143951
    },
    "rb": {
      "x": 31.582440020418584,
      "y": 73.81316998468607
    },
    "lm": {
      "x": 2,
      "y": 51.301684532924966
    },
    "cm": {
      "x": 27.76416539050536,
      "y": 51.454823889739664
    },
    "rm": {
      "x": 63.92547217968352,
      "y": 49.77029096477795
    },
    "st": {
      "x": 5.977539561000513,
      "y": 35.68147013782542
    }
  },
  "corner_atk": {
    "gk": {
      "x": 50.224604389994894,
      "y": 58.95865237366002
    },
    "lb": {
      "x": 46.40632976008168,
      "y": 37.519142419601835
    },
    "rb": {
      "x": 62.57784583971415,
      "y": 28.330781010719758
    },
    "lm": {
      "x": 23.721286370597248,
      "y": 16.998468606431853
    },
    "cm": {
      "x": 3.282286881061769,
      "y": 4.134762633996937
    },
    "rm": {
      "x": 76.95252679938746,
      "y": 17.151607963246555
    },
    "st": {
      "x": 50.224604389994894,
      "y": 8.88208269525268
    },
    "ball": {
      "x": 3.731495661051559,
      "y": 2.2970903522205206
    }
  },
  "kickoff_def": {
    "lb": {
      "x": 38.32057172026545,
      "y": 79.32618683001532
    },
    "rb": {
      "x": 61.67942827973456,
      "y": 79.63246554364471
    },
    "lm": {
      "x": 20.576824910668712,
      "y": 53.751914241960186
    },
    "cm": {
      "x": 46.18172537008679,
      "y": 60.18376722817764
    },
    "rm": {
      "x": 83.01684532924962,
      "y": 52.67993874425727
    },
    "st": {
      "x": 54.9412965798877,
      "y": 59.87748851454824
    }
  },
  "goalkick_def": {
    "gk": {
      "x": 50.224604389994894,
      "y": 60.33690658499234
    },
    "lb": {
      "x": 27.314956610515573,
      "y": 44.257274119448695
    },
    "rb": {
      "x": 71.33741704951507,
      "y": 44.104134762634
    },
    "lm": {
      "x": 13.838693210821852,
      "y": 35.68147013782542
    },
    "cm": {
      "x": 43.93568147013783,
      "y": 35.068912710566615
    },
    "rm": {
      "x": 87.95814190913732,
      "y": 35.52833078101072
    },
    "st": {
      "x": 56.96273608984176,
      "y": 35.37519142419602
    },
    "ball": {
      "x": 48.652373660030634,
      "y": 8.575803981623277
    }
  },
  "throwin_def": {
    "ball": {
      "x": 3.9561000510464552,
      "y": 42.11332312404288
    },
    "gk": {
      "x": 41.24042879019908,
      "y": 88.6676875957121
    },
    "lb": {
      "x": 10.918836140888212,
      "y": 58.49923430321593
    },
    "rb": {
      "x": 35.17611026033691,
      "y": 68.60643185298622
    },
    "lm": {
      "x": 8.223583460949467,
      "y": 52.37366003062787
    },
    "cm": {
      "x": 28.213374170495154,
      "y": 48.85145482388974
    },
    "rm": {
      "x": 50.89841755997959,
      "y": 58.95865237366002
    },
    "st": {
      "x": 20.576824910668712,
      "y": 37.97856049004594
    }
  },
  "corner_def": {
    "gk": {
      "x": 51.12302194997448,
      "y": 96.63093415007657
    },
    "lb": {
      "x": 39.218989280245026,
      "y": 94.02756508422665
    },
    "rb": {
      "x": 61.005615109749876,
      "y": 95.55895865237366
    },
    "lm": {
      "x": 35.849923430321596,
      "y": 89.43338437978561
    },
    "cm": {
      "x": 49.326186830015324,
      "y": 89.2802450229709
    },
    "rm": {
      "x": 60.78101071975498,
      "y": 90.35222052067381
    },
    "st": {
      "x": 50.000000000000014,
      "y": 58.03981623277183
    },
    "ball": {
      "x": 96.04389994895357,
      "y": 97.54977029096477
    }
  }
};

const DEFAULT_QUESTION_BANK = [
  {
    "id": "drop",
    "term": "Drop",
    "prompt": "Your teammate needs to make a safe pass. If she were to hear someone yelling drop, where should she pass the ball?",
    "context": [
      {
        "x": 50,
        "y": 45,
        "render": "ball",
        "label": "Has the ball"
      },
      {
        "x": 45.957120980091894,
        "y": 48.23889739663094,
        "render": "player",
        "shape": "twin_buns",
        "colors": {
          "H": "#e8c170",
          "S": "#8d5524"
        },
        "label": "Teammate"
      },
      {
        "x": 41.015824400204195,
        "y": 37.97856049004594,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 56.96273608984176,
        "y": 38.13169984686064,
        "render": "attacker",
        "label": "OTHER TEAM"
      }
    ],
    "zones": [
      {
        "xMin": 40.5666156202144,
        "xMax": 61.67942827973456,
        "yMin": 62.78713629402757,
        "yMax": 84.22664624808576
      }
    ]
  },
  {
    "id": "wide",
    "term": "Wide",
    "prompt": "Your teammate has a ball and wants to play it 'Wide away from defenders. Click where she should pass it to play it \"wide\"?",
    "context": [
      {
        "x": 50,
        "y": 50,
        "render": "ball",
        "label": "Ball in the middle"
      },
      {
        "x": 45.957120980091894,
        "y": 53.905053598774884,
        "render": "player",
        "shape": "bandana",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "eyeRow": "KSBBSS",
        "label": "Teammate"
      },
      {
        "x": 32.03164880040838,
        "y": 35.37519142419602,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 48.203164880040845,
        "y": 40.58192955589586,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 60.1071975497703,
        "y": 35.068912710566615,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 45.957120980091894,
        "y": 27.71822358346095,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 34.95150587034202,
        "y": 74.27258805513017,
        "render": "player",
        "shape": "high_ponytail",
        "colors": {
          "H": "#ff70a6",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 67.74374680959674,
        "y": 74.88514548238896,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#ffd166",
          "N": "#a8dadc",
          "S": "#8d5524"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 3.506891271056664,
        "y": 43.03215926493109,
        "render": "player",
        "shape": "curly",
        "colors": {
          "H": "#48cae4",
          "S": "#a9714f"
        },
        "label": "Teammate"
      },
      {
        "x": 96.71771311893824,
        "y": 43.797856049004594,
        "render": "player",
        "shape": "long_hair",
        "colors": {
          "H": "#2ec4b6",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      }
    ],
    "zones": [
      {
        "xMin": 4,
        "xMax": 18,
        "yMin": 20,
        "yMax": 80
      },
      {
        "xMin": 82,
        "xMax": 96,
        "yMin": 20,
        "yMax": 80
      },
      {
        "xMin": 81.22001020929046,
        "xMax": 99,
        "yMin": 14.701378254211333,
        "yMax": 66.15620214395099
      },
      {
        "xMin": 2.8330781010719783,
        "xMax": 19.453802960694237,
        "yMin": 14.088820826952528,
        "yMax": 69.37212863705973
      }
    ]
  },
  {
    "id": "through",
    "term": "Through Ball",
    "prompt": "Click on where you should pass the pass to play a \"through ball\" to your teammate.",
    "context": [
      {
        "x": 35,
        "y": 32,
        "render": "defender",
        "label": "DEF"
      },
      {
        "x": 65,
        "y": 32,
        "render": "defender",
        "label": "DEF"
      },
      {
        "x": 64.59928534966821,
        "y": 42.41960183767228,
        "render": "ball",
        "label": "Ball"
      },
      {
        "x": 70.43899948953548,
        "y": 50.38284839203675,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#8b5fbf",
          "N": "#a8dadc",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 13.614088820826955,
        "y": 35.68147013782542,
        "render": "player",
        "shape": "twin_buns",
        "colors": {
          "H": "#e8c170",
          "S": "#8d5524"
        },
        "label": "Teammate"
      },
      {
        "x": 26.64114344053089,
        "y": 65.08422664624808,
        "render": "player",
        "shape": "pigtails",
        "colors": {
          "H": "#3a2e2e",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 71.33741704951507,
        "y": 66.9218989280245,
        "render": "player",
        "shape": "cap_visor",
        "colors": {
          "H": "#3a2e2e",
          "N": "#5a9b5a",
          "S": "#a9714f"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 92.89943848902502,
        "y": 50.22970903522205,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#8b5fbf",
          "N": "#a8dadc",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      }
    ],
    "zones": [
      {
        "xMin": 21.475242470648297,
        "xMax": 55.1659009698826,
        "yMin": 10.719754977029096,
        "yMax": 24.808575803981622
      }
    ]
  },
  {
    "id": "goalside",
    "term": "Goal Side",
    "prompt": "Being 'goal side' means standing between an attacker and the goal you're defending (bottom). Tap the spot that is goal side of the blue attacker.",
    "context": [
      {
        "x": 60,
        "y": 72,
        "render": "attacker",
        "label": "ATT"
      }
    ],
    "zones": [
      {
        "xMin": 45.957120980091894,
        "xMax": 62.57784583971415,
        "yMin": 73.96630934150078,
        "yMax": 85.91117917304747
      }
    ]
  },
  {
    "id": "buildout",
    "term": "Build-Out Line",
    "prompt": "It's your goal kick. Opponents must stay behind the dashed build-out line until you play the ball. Tap the area where they have to wait. behind.",
    "context": [
      {
        "x": 50,
        "y": 88,
        "render": "ball",
        "label": "Goal kick"
      },
      {
        "x": 48.203164880040845,
        "y": 92.18989280245023,
        "render": "player",
        "shape": "long_hair",
        "colors": {
          "H": "#2ec4b6",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 18.77998979070955,
        "y": 93.10872894333843,
        "render": "player",
        "shape": "afro",
        "colors": {
          "H": "#c1502e",
          "S": "#a9714f"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 79.6477794793262,
        "y": 95.55895865237366,
        "render": "player",
        "shape": "bandana",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "eyeRow": "KSBBSS",
        "label": "Teammate"
      },
      {
        "x": 6.875957120980095,
        "y": 76.72281776416538,
        "render": "player",
        "shape": "curly",
        "colors": {
          "H": "#48cae4",
          "S": "#a9714f"
        },
        "label": "Teammate"
      },
      {
        "x": 93.12404287901992,
        "y": 77.7947932618683,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#8b5fbf",
          "N": "#a8dadc",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 50.89841755997959,
        "y": 79.17304747320061,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#8b5fbf",
          "N": "#a8dadc",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 50.89841755997959,
        "y": 53.29249617151608,
        "render": "player",
        "shape": "long_hair",
        "colors": {
          "H": "#1f1b24",
          "S": "#d9a066"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      }
    ],
    "zones": [
      {
        "xMin": 3.057682491066873,
        "xMax": 97.16692189892804,
        "yMin": 61.255742725880545,
        "yMax": 67.22817764165391
      }
    ]
  },
  {
    "id": "custom-1781661743550",
    "term": "Offsides!",
    "prompt": "Click the player on your team who is in an offsides position. ",
    "context": [
      {
        "x": 13.389484430832061,
        "y": 36.29402756508423,
        "render": "player",
        "shape": "long_hair",
        "colors": {
          "H": "#1f1b24",
          "S": "#d9a066"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 48.87697805002553,
        "y": 38.28483920367535,
        "render": "player",
        "shape": "curly",
        "colors": {
          "H": "#48cae4",
          "S": "#a9714f"
        },
        "label": "Teammate"
      },
      {
        "x": 88.18274629913222,
        "y": 27.105666156202147,
        "render": "player",
        "shape": "long_hair",
        "colors": {
          "H": "#2ec4b6",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 64.37468095967331,
        "y": 63.70597243491577,
        "render": "player",
        "shape": "cap_visor",
        "colors": {
          "H": "#3a2e2e",
          "N": "#5a9b5a",
          "S": "#a9714f"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 50.449208779989796,
        "y": 93.72128637059724,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#8b5fbf",
          "N": "#a8dadc",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 13.164880040837165,
        "y": 62.480857580398165,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#8b5fbf",
          "N": "#a8dadc",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 91.32720775906076,
        "y": 49.77029096477795,
        "render": "player",
        "shape": "long_hair",
        "colors": {
          "H": "#1f1b24",
          "S": "#d9a066"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 77.17713118938234,
        "y": 30.16845329249617,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 51.79683511995917,
        "y": 29.402756508422666,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 26.41653905053599,
        "y": 30.781010719754974,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 28.662582950484943,
        "y": 48.545176110260336,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 43.93568147013783,
        "y": 61.40888208269525,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 72.01123021949975,
        "y": 49.15773353751914,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 84.81368044920879,
        "y": 46.86064318529862,
        "render": "ball",
        "label": "Ball"
      }
    ],
    "zones": [
      {
        "xMin": 79.6477794793262,
        "xMax": 94.69627360898419,
        "yMin": 18.83614088820827,
        "yMax": 31.699846860643184
      }
    ]
  },
  {
    "id": "custom-1781661827106",
    "term": "Offsides!",
    "prompt": "Click the player who is in an offsides position",
    "context": [
      {
        "x": 17.881572230729965,
        "y": 12.098009188361408,
        "render": "player",
        "shape": "headband_long",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "label": "Teammate"
      },
      {
        "x": 49.77539561000511,
        "y": 34.915773353751916,
        "render": "player",
        "shape": "long_hair",
        "colors": {
          "H": "#2ec4b6",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 91.32720775906076,
        "y": 24.042879019908117,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#8b5fbf",
          "N": "#a8dadc",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 79.8723838693211,
        "y": 58.49923430321593,
        "render": "player",
        "shape": "cap_visor",
        "colors": {
          "H": "#3a2e2e",
          "N": "#5a9b5a",
          "S": "#a9714f"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 53.144461459928536,
        "y": 65.3905053598775,
        "render": "player",
        "shape": "headband_long",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "label": "Teammate"
      },
      {
        "x": 19.229198570699342,
        "y": 50.68912710566615,
        "render": "player",
        "shape": "high_ponytail",
        "colors": {
          "H": "#ff70a6",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 53.59367023991833,
        "y": 94.02756508422665,
        "render": "player",
        "shape": "bandana",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "eyeRow": "KSBBSS",
        "label": "Teammate"
      },
      {
        "x": 50.6738131699847,
        "y": 3.6753445635528332,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 25.06891271056662,
        "y": 19.29555895865237,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 52.24604389994896,
        "y": 27.411944869831544,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 80.09698825931598,
        "y": 31.852986217457886,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 28.437978560490052,
        "y": 43.33843797856049,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 22.822868810617667,
        "y": 28.177641653905056,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 67.06993363961206,
        "y": 44.4104134762634,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 63.476263399693735,
        "y": 29.402756508422666,
        "render": "ball",
        "label": "Ball"
      }
    ],
    "zones": [
      {
        "xMin": 10.918836140888212,
        "xMax": 24.170495150587037,
        "yMin": 7.197549770290965,
        "yMax": 16.38591117917305
      }
    ]
  },
  {
    "id": "custom-1781661906982",
    "term": "Passing Lane",
    "prompt": "There is an open passing lane.  Click on the teammate who you should pass the ball to?",
    "context": [
      {
        "x": 27.76416539050536,
        "y": 63.55283307810107,
        "render": "player",
        "shape": "headband_long",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "label": "Teammate"
      },
      {
        "x": 50.6738131699847,
        "y": 93.56814701378255,
        "render": "player",
        "shape": "pigtails",
        "colors": {
          "H": "#3a2e2e",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 87.05972434915775,
        "y": 55.4364471669219,
        "render": "player",
        "shape": "high_ponytail",
        "colors": {
          "H": "#ff70a6",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 88.63195507912202,
        "y": 34.30321592649311,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#ffd166",
          "N": "#a8dadc",
          "S": "#8d5524"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 44.160285860132724,
        "y": 29.709035222052066,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#ffd166",
          "N": "#a8dadc",
          "S": "#8d5524"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 21.924451250638086,
        "y": 43.797856049004594,
        "render": "player",
        "shape": "twin_buns",
        "colors": {
          "H": "#e8c170",
          "S": "#8d5524"
        },
        "label": "Teammate"
      },
      {
        "x": 54.49208779989792,
        "y": 56.96784073506891,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#ffd166",
          "N": "#a8dadc",
          "S": "#8d5524"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 61.45482388973967,
        "y": 59.41807044410413,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 89.0811638591118,
        "y": 40.73506891271057,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 74.7064828994385,
        "y": 34.60949464012251,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 34.50229709035222,
        "y": 44.86983154670751,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 50.89841755997959,
        "y": 3.828483920367534,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 39.218989280245026,
        "y": 58.49923430321593,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 71.33741704951507,
        "y": 17.151607963246555,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 84.1398672792241,
        "y": 56.04900459418071,
        "render": "ball",
        "label": "Ball"
      }
    ],
    "zones": [
      {
        "xMin": 37.19754977029097,
        "xMax": 50.6738131699847,
        "yMin": 24.808575803981622,
        "yMax": 35.068912710566615
      }
    ]
  },
  {
    "id": "custom-1781662105969",
    "term": "Support",
    "prompt": "Your teammate has no passing options! Click where your left back should move to, to provide support (a passing option).",
    "context": [
      {
        "x": 72.23583460949466,
        "y": 64.62480857580398,
        "render": "player",
        "shape": "high_ponytail",
        "colors": {
          "H": "#ff70a6",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 90.65339458907606,
        "y": 41.34762633996937,
        "render": "player",
        "shape": "curly",
        "colors": {
          "H": "#48cae4",
          "S": "#a9714f"
        },
        "label": "Teammate"
      },
      {
        "x": 47.97856049004594,
        "y": 26.339969372128635,
        "render": "player",
        "shape": "long_hair",
        "colors": {
          "H": "#2ec4b6",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 55.615109749872396,
        "y": 45.3292496171516,
        "render": "player",
        "shape": "high_ponytail",
        "colors": {
          "H": "#ff70a6",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 21.924451250638086,
        "y": 56.50842266462482,
        "render": "player",
        "shape": "high_ponytail",
        "colors": {
          "H": "#ff70a6",
          "S": "#f4c89e"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 50.89841755997959,
        "y": 95.55895865237366,
        "render": "player",
        "shape": "headband_long",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "label": "Teammate"
      },
      {
        "x": 20.352220520673818,
        "y": 31.08728943338438,
        "render": "player",
        "shape": "pigtails",
        "colors": {
          "H": "#3a2e2e",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 72.68504338948443,
        "y": 52.67993874425727,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 46.85553854007147,
        "y": 52.526799387442566,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 27.98876978050026,
        "y": 40.58192955589586,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 62.353241449719256,
        "y": 33.537519142419605,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 80.32159264931089,
        "y": 43.03215926493109,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 55.1659009698826,
        "y": 59.11179173047473,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 65.048494129658,
        "y": 65.69678407350689,
        "render": "ball",
        "label": "Ball"
      },
      {
        "x": 50.89841755997959,
        "y": 5.359877488514548,
        "render": "attacker",
        "label": "OTHER TEAM"
      }
    ],
    "zones": [
      {
        "xMin": 14.737110770801431,
        "xMax": 39.218989280245026,
        "yMin": 66.7687595712098,
        "yMax": 77.33537519142419
      }
    ]
  },
  {
    "id": "custom-1781662295967",
    "term": "Mark up",
    "prompt": "It is a free kick for the other team. Find the unmarked player.",
    "context": [
      {
        "x": 28.88718734047984,
        "y": 38.89739663093415,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 49.77539561000511,
        "y": 13.476263399693721,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 5.528330781010723,
        "y": 65.3905053598775,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 25.742725880551305,
        "y": 69.06584992343032,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 90.42879019908118,
        "y": 68.30015313935681,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 59.20877998979071,
        "y": 46.40122511485452,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 55.1659009698826,
        "y": 68.45329249617151,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 33.82848392036754,
        "y": 45.635528330781014,
        "render": "ball",
        "label": "Ball"
      },
      {
        "x": 14.737110770801431,
        "y": 52.220520673813176,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 58.08575803981624,
        "y": 52.37366003062787,
        "render": "player",
        "shape": "afro",
        "colors": {
          "H": "#c1502e",
          "S": "#a9714f"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 89.3057682491067,
        "y": 73.04747320061256,
        "render": "player",
        "shape": "cap_visor",
        "colors": {
          "H": "#3a2e2e",
          "N": "#5a9b5a",
          "S": "#a9714f"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 16.3093415007657,
        "y": 59.724349157733535,
        "render": "player",
        "shape": "curly",
        "colors": {
          "H": "#48cae4",
          "S": "#a9714f"
        },
        "label": "Teammate"
      },
      {
        "x": 11.592649310872897,
        "y": 73.35375191424195,
        "render": "player",
        "shape": "cap_visor",
        "colors": {
          "H": "#3a2e2e",
          "N": "#5a9b5a",
          "S": "#a9714f"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 29.111791730474735,
        "y": 77.33537519142419,
        "render": "player",
        "shape": "shades_long",
        "colors": {
          "H": "#ffd166",
          "N": "#a8dadc",
          "S": "#8d5524"
        },
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 51.12302194997448,
        "y": 95.40581929555896,
        "render": "player",
        "shape": "long_hair",
        "colors": {
          "H": "#1f1b24",
          "S": "#d9a066"
        },
        "mouthRow": "KSSSSM",
        "label": "Teammate"
      },
      {
        "x": 81.44461459928536,
        "y": 82.84839203675345,
        "render": "player",
        "shape": "bandana",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "eyeRow": "KSBBSS",
        "label": "Teammate"
      },
      {
        "x": 37.87136294027565,
        "y": 87.59571209800919,
        "render": "player",
        "shape": "bandana",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "eyeRow": "KSBBSS",
        "label": "Teammate"
      }
    ],
    "zones": [
      {
        "xMin": 41.465033180193984,
        "xMax": 65.048494129658,
        "yMin": 60.18376722817764,
        "yMax": 74.57886676875957
      }
    ]
  },
  {
    "id": "custom-1781662487657",
    "term": "Get Wide!",
    "prompt": "Your team is on offense and is too clumped up where should your right midfielder go to get wide?",
    "context": [
      {
        "x": 35.849923430321596,
        "y": 62.17457886676876,
        "render": "player",
        "shape": "cap_visor",
        "colors": {
          "H": "#3a2e2e",
          "N": "#5a9b5a",
          "S": "#a9714f"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 58.310362429811136,
        "y": 66.3093415007657,
        "render": "player",
        "shape": "pigtails",
        "colors": {
          "H": "#3a2e2e",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 50.89841755997959,
        "y": 39.50995405819295,
        "render": "player",
        "shape": "twin_buns",
        "colors": {
          "H": "#e8c170",
          "S": "#8d5524"
        },
        "label": "Teammate"
      },
      {
        "x": 72.90964777947934,
        "y": 55.895865237366,
        "render": "player",
        "shape": "curly",
        "colors": {
          "H": "#48cae4",
          "S": "#a9714f"
        },
        "label": "Teammate"
      },
      {
        "x": 10.918836140888212,
        "y": 48.23889739663094,
        "render": "player",
        "shape": "bandana",
        "colors": {
          "H": "#6b4423",
          "N": "#e63946",
          "S": "#f4c89e"
        },
        "eyeRow": "KSBBSS",
        "label": "Teammate"
      },
      {
        "x": 39.218989280245026,
        "y": 49.004594180704444,
        "render": "player",
        "shape": "pigtails",
        "colors": {
          "H": "#3a2e2e",
          "S": "#d9a066"
        },
        "eyeRow": "KSBBSS",
        "mouthRow": "KSSWWM",
        "label": "Teammate"
      },
      {
        "x": 51.12302194997448,
        "y": 94.94640122511485,
        "render": "player",
        "shape": "twin_buns",
        "colors": {
          "H": "#e8c170",
          "S": "#8d5524"
        },
        "label": "Teammate"
      },
      {
        "x": 53.144461459928536,
        "y": 45.3292496171516,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 42.36345074017356,
        "y": 31.08728943338438,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 32.480857580398165,
        "y": 41.50076569678408,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 47.080142930066366,
        "y": 58.34609494640123,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 55.390505359877494,
        "y": 53.905053598774884,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 66.84532924961715,
        "y": 49.004594180704444,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 49.77539561000511,
        "y": 5.66615620214395,
        "render": "attacker",
        "label": "OTHER TEAM"
      },
      {
        "x": 60.1071975497703,
        "y": 67.07503828483921,
        "render": "ball",
        "label": "Ball"
      }
    ],
    "zones": [
      {
        "xMin": 89.5303726391016,
        "xMax": 96.71771311893824,
        "yMin": 51.91424196018377,
        "yMax": 62.63399693721286
      }
    ]
  }
];

// Converts a click event on a field SVG (sized via CSS object-fit: contain,
// which can letterbox if the element's box doesn't match the viewBox aspect
// ratio) into a percentage position within the SVG's own coordinate space.
// Using getBoundingClientRect() directly here would be wrong whenever the
// element's box is wider/taller than the letterboxed content, since clicks
// in the letterbox gutter would otherwise get mapped as if they were on the
// pitch - this clamps to the visible content rect first.
function fieldClickToPercent(e, viewboxW, viewboxH) {
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

function checkAnswer(question, tap) {
  if (question.type === 'position') {
    const dx = Math.abs(tap.x - question.target.x);
    const dy = Math.abs(tap.y - question.target.y);
    return dx <= 18 && dy <= 13;
  }
  return question.zones.some((z) => tap.x >= z.xMin && tap.x <= z.xMax && tap.y >= z.yMin && tap.y <= z.yMax);
}

function generatePositionQuestion(assignments, positionData) {
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
    prompt: `${situation.group} \u2014 ${situation.side}: where should ${subject} be?`,
    target,
    context,
  };
}

function generateQuestion(assignments, positionData, questionBank) {
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

function renderContextMarker(marker, key) {
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
        <g transform={`translate(${px - 6 * scale} ${py - 8 * scale}) scale(${scale})`}>{getSpriteRects(marker.shape, kitColors(marker.colors), marker.eyeRow, marker.mouthRow)}</g>
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

/* =========================================================================
   STORAGE
   Persists squad + coach position data across sessions via the artifact
   storage API. NOTE: window.storage only exists when this runs as a
   claude.ai artifact - the standalone HTML build has no persistence and
   will just keep everything in memory for that session.
   ========================================================================= */

const STORAGE_AVAILABLE = typeof window !== 'undefined' && !!window.storage;

async function loadJSON(key, fallback) {
  if (!STORAGE_AVAILABLE) return fallback;
  try {
    const res = await window.storage.get(key);
    return res ? JSON.parse(res.value) : fallback;
  } catch {
    return fallback;
  }
}

async function saveJSON(key, value) {
  if (!STORAGE_AVAILABLE) return;
  try {
    await window.storage.set(key, JSON.stringify(value));
  } catch {
    // best-effort; not fatal if a save fails
  }
}

/* =========================================================================
   STYLES
   ========================================================================= */

function GlobalStyles() {
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

/* =========================================================================
   VENUES (home fields)
   Each venue swaps the field's color palette and adds a few small
   decorative touches, without changing the 300x440 layout, the pitch
   boundary, or any coordinate math - decorations are drawn either behind
   the grass (so they never sit on top of a player sprite) or tucked into
   the corners, away from where markers/positions are ever placed.
   ========================================================================= */

const VENUES = [
  {
    id: 'union_stadium',
    name: 'Union Stadium',
    blurb: 'The big one. Real stands, real fans, real floodlights.',
  },
  {
    id: 'cherry_street',
    name: 'Cherry Street Park',
    blurb: 'A proper community pitch with a fence and a couple of trees.',
  },
  {
    id: 'sleighton_field',
    name: 'Sleighton Field',
    blurb: 'A normal local field. Decent grass, nothing fancy.',
  },
  {
    id: 'elementary_school',
    name: 'Elementary School',
    blurb: 'The blacktop. Painted lines on asphalt - watch your knees.',
  },
  {
    id: 'vacant_lot',
    name: 'Springton Lake',
    blurb: "A scrappy lakeside field. Grass is patchy but the view isn't bad.",
  },
];
const DEFAULT_VENUE_ID = VENUES[0].id;

/* =========================================================================
   FIELD MARKINGS (shared by Squad field and Coach field)
   ========================================================================= */

function FieldMarkings({ W, H, venue = DEFAULT_VENUE_ID }) {
  const stripes = 8;
  const stripeH = H / stripes;

  // Per-venue palette. Elementary School is asphalt (no grass stripes at
  // all - flat gray with painted-court-style lines). Springton Lake swaps
  // grass for dirt with patchy tufts. Everyone else is a green field with
  // slightly different tones/line crispness.
  const PALETTES = {
    union_stadium: { g1: '#3f9450', g2: '#2f7a3e', line: '#ffffff', lineOpacity: 1 },
    cherry_street: { g1: '#3f8f4f', g2: '#347d40', line: '#f1f1f1', lineOpacity: 1 },
    sleighton_field: { g1: '#7a9650', g2: '#6c8a46', line: '#e8e4d8', lineOpacity: 0.9 },
    elementary_school: { g1: '#5a5d63', g2: '#52555a', line: '#ffd166', lineOpacity: 0.95 },
    vacant_lot: { g1: '#9c8259', g2: '#8a7049', line: '#d8cfb8', lineOpacity: 0.55 },
  };
  const pal = PALETTES[venue] || PALETTES[DEFAULT_VENUE_ID];
  const isBlacktop = venue === 'elementary_school';

  return (
    <>
      <rect x="0" y="0" width={W} height={H} fill={pal.g2} />
      {!isBlacktop && Array.from({ length: stripes }).map((_, i) => (
        i % 2 === 0 && <rect key={i} x="0" y={i * stripeH} width={W} height={stripeH} fill={pal.g1} />
      ))}

      {/* Elementary School: flat asphalt with a few faint crack lines and
          patched-resurface blotches, instead of mown-grass stripes. */}
      {isBlacktop && (
        <g opacity="0.5" stroke="#3d3f44" strokeWidth="1" fill="none">
          <path d="M 30 50 L 55 90 L 45 140" />
          <path d="M 220 30 L 200 70 L 230 110" />
          <path d="M 60 280 L 90 320 L 75 370" />
          <path d="M 240 320 L 215 360 L 245 400" />
          <rect x="170" y="180" width="38" height="22" fill="#60636a" stroke="none" opacity="0.6" />
        </g>
      )}

      {/* Springton Lake: patchy dead-grass blotches scattered across the
          dirt, drawn before the line markings so they read as ground
          texture. */}
      {venue === 'vacant_lot' && (
        <g opacity="0.5">
          <ellipse cx="40" cy="60" rx="22" ry="10" fill="#6b7d3a" />
          <ellipse cx="245" cy="120" rx="18" ry="9" fill="#5c6e32" />
          <ellipse cx="70" cy="220" rx="26" ry="11" fill="#6b7d3a" />
          <ellipse cx="220" cy="260" rx="20" ry="9" fill="#5c6e32" />
          <ellipse cx="100" cy="360" rx="24" ry="10" fill="#6b7d3a" />
          <ellipse cx="200" cy="400" rx="16" ry="8" fill="#5c6e32" />
        </g>
      )}

      {/* Union Stadium: two rows of stands top and bottom (deeper crowd
          presence than the other venues' single accent line), a small
          scoreboard, and taller floodlight towers with light fixtures -
          the clear "biggest venue" of the five. */}
      {venue === 'union_stadium' && (
        <g>
          <rect x="0" y="0" width={W} height="14" fill="#23264a" />
          <rect x="0" y={H - 14} width={W} height="14" fill="#23264a" />
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={`ts1-${i}`} x={i * (W / 24)} y="1" width={W / 24 - 0.6} height="4.5" fill={i % 4 === 0 ? '#ffd166' : i % 2 === 0 ? '#e63946' : '#f1faee'} />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={`ts2-${i}`} x={i * (W / 24)} y="6.5" width={W / 24 - 0.6} height="6" fill={i % 4 === 1 ? '#e63946' : i % 2 === 0 ? '#ffd166' : '#f1faee'} />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={`bs1-${i}`} x={i * (W / 24)} y={H - 11.5} width={W / 24 - 0.6} height="6" fill={i % 4 === 1 ? '#e63946' : i % 2 === 0 ? '#ffd166' : '#f1faee'} />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={`bs2-${i}`} x={i * (W / 24)} y={H - 5} width={W / 24 - 0.6} height="4.5" fill={i % 4 === 0 ? '#ffd166' : i % 2 === 0 ? '#e63946' : '#f1faee'} />
          ))}
          {/* Scoreboard, centered above the top stands */}
          <rect x={W / 2 - 16} y="0" width="32" height="6" fill="#10122a" stroke="#ffd166" strokeWidth="0.6" />
          <rect x={W / 2 - 12} y="1.4" width="8" height="3.2" fill="#3fbf73" opacity="0.85" />
          <rect x={W / 2 + 4} y="1.4" width="8" height="3.2" fill="#e63946" opacity="0.85" />
          {/* Floodlight towers - taller posts with a light fixture head */}
          <rect x="0.5" y="14" width="5" height="14" fill="#3a3f6e" />
          <rect x="-1" y="12" width="8" height="3.5" fill="#cfd3f0" />
          <rect x={W - 5.5} y="14" width="5" height="14" fill="#3a3f6e" />
          <rect x={W - 7} y="12" width="8" height="3.5" fill="#cfd3f0" />
          <rect x="0.5" y={H - 28} width="5" height="14" fill="#3a3f6e" />
          <rect x="-1" y={H - 15.5} width="8" height="3.5" fill="#cfd3f0" />
          <rect x={W - 5.5} y={H - 28} width="5" height="14" fill="#3a3f6e" />
          <rect x={W - 7} y={H - 15.5} width="8" height="3.5" fill="#cfd3f0" />
        </g>
      )}

      {/* Cherry Street Park: a thin chain-link-style fence dashed just
          outside the pitch line, plus a couple of corner trees. */}
      {venue === 'cherry_street' && (
        <g>
          <rect x="2" y="2" width={W - 4} height={H - 4} fill="none" stroke="#9aa3c7" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
          <circle cx="14" cy="14" r="7" fill="#2d6a4f" />
          <rect x="12" y="20" width="4" height="6" fill="#5c4530" />
          <circle cx={W - 14} cy={H - 14} r="7" fill="#2d6a4f" />
          <rect x={W - 16} y={H - 26} width="4" height="6" fill="#5c4530" />
        </g>
      )}

      <rect x="10" y="10" width={W - 20} height={H - 20} fill="none" stroke={pal.line} strokeWidth="2" opacity={pal.lineOpacity} />
      <line x1="10" y1={H / 2} x2={W - 10} y2={H / 2} stroke={pal.line} strokeWidth="2" opacity={pal.lineOpacity} />
      <circle cx={W / 2} cy={H / 2} r="40" fill="none" stroke={pal.line} strokeWidth="2" opacity={pal.lineOpacity} />
      <circle cx={W / 2} cy={H / 2} r="2.5" fill={pal.line} opacity={pal.lineOpacity} />
      {/* build-out lines (midway between each goal box arc and the center circle) */}
      <line x1="10" y1="147.5" x2={W - 10} y2="147.5" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
      <line x1="10" y1="292.5" x2={W - 10} y2="292.5" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
      {/* opponent's goal (top) */}
      <rect x="70" y="10" width="160" height="65" fill="none" stroke={pal.line} strokeWidth="2" opacity={pal.lineOpacity} />
      <rect x="115" y="10" width="70" height="28" fill="none" stroke={pal.line} strokeWidth="2" opacity={pal.lineOpacity} />
      <path d="M 120 75 A 30 30 0 0 0 180 75" fill="none" stroke={pal.line} strokeWidth="2" opacity={pal.lineOpacity} />
      <rect x="130" y="4" width="40" height="6" fill={pal.line} opacity={pal.lineOpacity} />
      {/* own goal (bottom) */}
      <rect x="70" y={H - 75} width="160" height="65" fill="none" stroke={pal.line} strokeWidth="2" opacity={pal.lineOpacity} />
      <rect x="115" y={H - 38} width="70" height="28" fill="none" stroke={pal.line} strokeWidth="2" opacity={pal.lineOpacity} />
      <path d={`M 120 ${H - 75} A 30 30 0 0 1 180 ${H - 75}`} fill="none" stroke={pal.line} strokeWidth="2" opacity={pal.lineOpacity} />
      <rect x="130" y={H - 10} width="40" height="6" fill={pal.line} opacity={pal.lineOpacity} />
    </>
  );
}

/* =========================================================================
   SQUAD FIELD (formation slots filled with player sprites)
   ========================================================================= */

function Field({ assignments, onSlotClick }) {
  const W = 300, H = 440;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp-field-svg" role="img" aria-label="Soccer field with formation positions">
      <FieldMarkings W={W} H={H} />
      {FORMATION_2_3_1.map((slot) => {
        const px = (slot.x / 100) * W;
        const py = (slot.y / 100) * H;
        const charId = assignments[slot.id];
        const char = findPlayer(charId);
        const scale = 3.0;
        return (
          <g key={slot.id} className="pp-slot" onClick={() => onSlotClick(slot.id)}>
            <ellipse cx={px} cy={py + 14} rx="20" ry="7" fill="rgba(0,0,0,0.25)" />
            {char ? (
              <g transform={`translate(${px - 6 * scale} ${py - 8 * scale}) scale(${scale})`}>
                {getSpriteRects(char.shape, kitColors(char.colors), char.eyeRow, char.mouthRow)}
              </g>
            ) : (
              <>
                <circle cx={px} cy={py} r="16" fill="rgba(255,255,255,0.08)" stroke="var(--field-line)" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x={px} y={py} className="pp-slot-label">{slot.label}</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================================
   COACH FIELD
   Shows faint dashed markers for the base 2-3-1 formation (reference), plus
   solid colored markers for the current situation's positions. Tapping
   anywhere on the field places the currently-selected position there.
   ========================================================================= */

function CoachField({ positions, selectedSlot, onFieldClick }) {
  const W = 300, H = 440;

  function handleClick(e) {
    const { x, y } = fieldClickToPercent(e, W, H);
    onFieldClick({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="pp-field-svg pp-coach-field"
      onClick={handleClick}
      role="img"
      aria-label="Soccer field - tap to place the selected position"
    >
      <FieldMarkings W={W} H={H} />

      {/* base formation reference (faint, dashed) */}
      {FORMATION_2_3_1.map((slot) => {
        const px = (slot.x / 100) * W;
        const py = (slot.y / 100) * H;
        return (
          <circle key={`ref-${slot.id}`} cx={px} cy={py} r="10" fill="none"
            stroke="var(--field-line)" strokeWidth="1" strokeDasharray="2 2" opacity="0.35" />
        );
      })}

      {/* current situation positions */}
      {FORMATION_2_3_1.map((slot) => {
        const pos = positions[slot.id];
        const px = (pos.x / 100) * W;
        const py = (pos.y / 100) * H;
        const isSelected = selectedSlot === slot.id;
        return (
          <g key={slot.id}>
            {isSelected && (
              <circle cx={px} cy={py} r="20" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />
            )}
            <circle cx={px} cy={py} r="14" fill={ROLE_COLOR[slot.id]} stroke="var(--bg)" strokeWidth="2" />
            <text x={px} y={py + 1} className="pp-coach-label">{slot.label}</text>
          </g>
        );
      })}

      {/* ball marker */}
      {(() => {
        const pos = positions.ball;
        const px = (pos.x / 100) * W;
        const py = (pos.y / 100) * H;
        const isSelected = selectedSlot === 'ball';
        const scale = 3;
        return (
          <g key="ball">
            {isSelected && (
              <circle cx={px} cy={py} r="18" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />
            )}
            <g transform={`translate(${px - 4 * scale} ${py - 4 * scale}) scale(${scale})`}>
              {getBallRects()}
            </g>
          </g>
        );
      })()}
    </svg>
  );
}

/* =========================================================================
   ROSTER CARD
   ========================================================================= */

function RosterCard({ player, selected, onClick }) {
  return (
    <div className={`pp-card${selected ? ' selected' : ''}`} onClick={onClick} role="button" tabIndex={0}>
      {selected && <span className="pp-card-badge pp-pixel">PLACING</span>}
      <PixelHead shape={player.shape} colors={player.colors} eyeRow={player.eyeRow} mouthRow={player.mouthRow} size={100} />
      <div className="pp-card-name">{player.name}</div>
      <div className="pp-card-tag">{player.tag}</div>
    </div>
  );
}

/* =========================================================================
   SQUAD SCREEN
   ========================================================================= */

function SquadScreen({ assignments, selectedId, onCardClick, onSlotClick, onAutoFill, onClear, venue, onContinueToVenue, unlockedIds }) {
  const assignedIds = new Set(Object.values(assignments));
  const unlocked = unlockedIds || [];
  const unlockedPlayers = UNLOCKABLE_ROSTER.filter((c) => unlocked.includes(c.id));
  const available = [...ROSTER, ...unlockedPlayers].filter((c) => !assignedIds.has(c.id));
  // Players unlock one at a time, in this fixed order, one per win - so the
  // wins-to-go for any still-locked player is just how many unlocks away it
  // is in the list, no need to know the team's total win count for this.
  const lockedPlayers = UNLOCKABLE_ROSTER
    .filter((c) => !unlocked.includes(c.id))
    .map((c, i) => ({ ...c, winsToGo: i + 1 }));
  const filledCount = Object.keys(assignments).length;
  const selectedPlayer = findPlayer(selectedId);

  return (
    <div className="pp-main">
      {/* Left: field */}
      <div className="pp-field-col">
        <svg viewBox="0 0 300 440" shapeRendering="crispEdges">
          <FieldMarkings W={300} H={440} venue={venue} />
          {FORMATION_2_3_1.map((slot) => {
            const px = (slot.x / 100) * 300;
            const py = (slot.y / 100) * 440;
            const charId = assignments[slot.id];
            const char = findPlayer(charId);
            const scale = 3.0;
            return (
              <g key={slot.id} className="pp-slot" onClick={() => onSlotClick(slot.id)}>
                <ellipse cx={px} cy={py + 14} rx="20" ry="7" fill="rgba(0,0,0,0.25)" />
                {char ? (
                  <g transform={`translate(${px - 6 * scale} ${py - 8 * scale}) scale(${scale})`}>
                    {getSpriteRects(char.shape, kitColors(char.colors), char.eyeRow, char.mouthRow)}
                  </g>
                ) : (
                  <>
                    <circle cx={px} cy={py} r="16" fill="rgba(255,255,255,0.08)" stroke="var(--field-line)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x={px} y={py} className="pp-slot-label">{slot.label}</text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right: controls + roster */}
      <div className="pp-sidebar">
        <div className="pp-sidebar-inner">
          <div className="pp-squad-hdr">
            <span className="pp-progress"><strong>{filledCount}</strong> / 7 FILLED</span>
            <div className="pp-action-bar">
              <button className="pp-btn" onClick={onAutoFill}><Shuffle size={12} /> AUTO</button>
              <button className="pp-btn" onClick={onClear}><RotateCcw size={12} /> CLEAR</button>
            </div>
          </div>

          <p className="pp-hint">
            {selectedPlayer
              ? <>Tap a field position to place <b>{selectedPlayer.name}</b>.</>
              : <>Tap a player, then tap a field position.</>}
          </p>

          {filledCount === 7 && (
            <>
              <hr className="pp-divider" />
              <span className="pp-label">STARTING SEVEN</span>
              <div className="pp-lineup-list">
                {FORMATION_2_3_1.map((slot) => {
                  const player = findPlayer(assignments[slot.id]);
                  return (
                    <div className="pp-lineup-row" key={slot.id}>
                      <span className="pp-lineup-pos">{slot.full}</span>
                      <PixelSprite shape={player.shape} colors={kitColors(player.colors)} eyeRow={player.eyeRow} mouthRow={player.mouthRow} size={28} />
                      <span className="pp-lineup-name">{player.name}</span>
                    </div>
                  );
                })}
              </div>
              {onContinueToVenue && (
                <button className="pp-btn primary full" onClick={onContinueToVenue}>
                  NEXT: CHOOSE HOME FIELD →
                </button>
              )}
              <hr className="pp-divider" />
            </>
          )}

          <span className="pp-label">BENCH</span>
          <div className="pp-roster-grid">
            {available.map((player) => (
              <div
                key={player.id}
                className={`pp-card${player.id === selectedId ? ' selected' : ''}`}
                onClick={() => onCardClick(player.id)}
              >
                {player.id === selectedId && <span className="pp-card-badge pp-pixel">PLACING</span>}
                <PixelHead shape={player.shape} colors={player.colors} eyeRow={player.eyeRow} mouthRow={player.mouthRow} size={72} />
                <div className="pp-card-name">{player.name}</div>
                <div className="pp-card-tag">{player.tag}</div>
              </div>
            ))}
            {lockedPlayers.map((player) => (
              <div key={player.id} className="pp-card pp-card-locked" aria-disabled="true">
                <span className="pp-card-lock-icon" aria-hidden="true">🔒</span>
                <PixelHead
                  shape={player.shape}
                  colors={{ H: '#3a3f55', N: '#3a3f55', S: '#3a3f55' }}
                  eyeRow={player.eyeRow}
                  mouthRow={player.mouthRow}
                  size={72}
                />
                <div className="pp-card-name pp-card-name-locked">???</div>
                <div className="pp-card-tag pp-card-tag-locked">
                  Win {player.winsToGo} more {player.winsToGo === 1 ? 'game' : 'games'} to unlock this player
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   COACH SCREEN
   ========================================================================= */

/* =========================================================================
   COACH MODE - QUESTION BANK EDITOR
   Lets the coach edit wording, context markers, and answer zones for any
   field-tap "terminology" question, and add new ones. Position questions
   (where a player should stand) stay auto-generated from the Positions
   tab's set-play data - their wording is templated, not edited here.
   ========================================================================= */

function EditField({ context, zones, pendingCorner, onTap }) {
  const W = 300, H = 440;
  function handleClick(e) {
    const { x, y } = fieldClickToPercent(e, W, H);
    onTap({ x: Math.max(1, Math.min(99, x)), y: Math.max(1, Math.min(99, y)) });
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp-coach-field" onClick={handleClick} role="img" aria-label="Tap to place markers or draw an answer zone">
      <FieldMarkings W={W} H={H} />
      {zones.map((z, i) => {
        const x = (z.xMin / 100) * W;
        const y = (z.yMin / 100) * H;
        const w = ((z.xMax - z.xMin) / 100) * W;
        const h = ((z.yMax - z.yMin) / 100) * H;
        return <rect key={`z-${i}`} x={x} y={y} width={w} height={h} fill="var(--accent-2)" opacity="0.25" stroke="var(--accent-2)" strokeWidth="2" strokeDasharray="4 3" />;
      })}
      {context.map((m, i) => renderContextMarker(m, `ctx-${i}`))}
      {pendingCorner && (() => {
        const px = (pendingCorner.x / 100) * W;
        const py = (pendingCorner.y / 100) * H;
        return <circle cx={px} cy={py} r="6" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />;
      })()}
    </svg>
  );
}

const MARKER_TYPES = [
  { id: 'ball', label: 'BALL' },
  { id: 'teammate', label: 'TEAMMATE' },
  { id: 'opponent', label: 'OTHER TEAM' },
];

function QuestionEditForm({ term, setTerm, prompt, setPrompt, context, setContext, zones, setZones, markerType, setMarkerType, zoneMode, setZoneMode, zoneCorner, setZoneCorner, isNew, onSave, onCancel, onDelete, questionId }) {
  const canSave = prompt.trim().length > 0 && zones.length > 0;

  return (
    <>
      <input
        className="pp-text-input"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Term (e.g. Through Ball) - optional"
        maxLength={30}
      />
      <textarea
        className="pp-textarea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Question prompt the player will read..."
        rows={4}
      />

      <p className="pp-hint">
        {zoneMode
          ? (zoneCorner ? 'Tap the opposite corner on the field to finish the answer zone.' : 'Tap one corner of the answer zone on the field.')
          : <>Tap the field to drop a <b>{MARKER_TYPES.find((m) => m.id === markerType)?.label.toLowerCase()}</b> marker, or tap ZONE to draw a correct-answer area (you can add more than one).</>}
      </p>

      <div className="pp-chip-row">
        {MARKER_TYPES.map((m) => (
          <button
            key={m.id}
            className={`pp-chip${!zoneMode && markerType === m.id ? ' active' : ''}`}
            onClick={() => { setMarkerType(m.id); setZoneMode(false); setZoneCorner(null); }}
          >
            + {m.label}
          </button>
        ))}
        <button
          className={`pp-chip${zoneMode ? ' active' : ''}`}
          onClick={() => { setZoneMode(true); setZoneCorner(null); }}
        >
          + ZONE
        </button>
      </div>

      {(context.length > 0 || zones.length > 0) && (
        <div className="pp-list">
          {context.map((m, i) => {
            const desc = m.render === 'ball' ? 'Ball'
              : m.render === 'player' ? 'Teammate'
              : (m.render === 'attacker' || m.render === 'defender') ? 'Other team'
              : m.render;
            return (
              <div className="pp-list-row" key={`m-${i}`}>
                <span>{desc} marker at ({Math.round(m.x)}, {Math.round(m.y)})</span>
                <button className="pp-list-remove" onClick={() => setContext((prev) => prev.filter((_, idx) => idx !== i))}>&times;</button>
              </div>
            );
          })}
          {zones.map((z, i) => (
            <div className="pp-list-row" key={`z-${i}`}>
              <span>Answer zone {i + 1}: x {Math.round(z.xMin)}-{Math.round(z.xMax)}, y {Math.round(z.yMin)}-{Math.round(z.yMax)}</span>
              <button className="pp-list-remove" onClick={() => setZones((prev) => prev.filter((_, idx) => idx !== i))}>&times;</button>
            </div>
          ))}
        </div>
      )}

      {!canSave && <p className="pp-hint">Needs a prompt and at least one answer zone before it can be saved.</p>}

      <div className="pp-action-bar">
        <button className="pp-btn" onClick={onCancel}>CANCEL</button>
        {!isNew && <button className="pp-btn" onClick={() => onDelete(questionId)}>DELETE</button>}
        <button className="pp-btn primary" disabled={!canSave} onClick={() => onSave({ id: questionId, term, prompt, context, zones })}>SAVE</button>
      </div>
    </>
  );
}

function QuestionBankList({ questionBank, onEdit, onAddNew }) {
  return (
    <>
      <p className="pp-hint">
        These are the field-tap "what does it mean" questions in Match Day. Tap one to edit its wording,
        markers, or answer zones, or add a new one below.
      </p>
      <div className="pp-list">
        {questionBank.map((q) => (
          <button key={q.id} className="pp-qbank-item" onClick={() => onEdit({ ...q })}>
            <span className="pp-qbank-term pp-pixel">{q.term || 'UNTITLED'}</span>
            <span className="pp-qbank-preview">{q.prompt}</span>
            <span className="pp-qbank-meta">{(q.zones || []).length} zone(s) &middot; {(q.context || []).length} marker(s)</span>
          </button>
        ))}
      </div>
      <div className="pp-action-bar">
        <button className="pp-btn primary" onClick={onAddNew}>+ ADD QUESTION</button>
      </div>
    </>
  );
}

function CoachScreen({ positionData, onUpdatePosition, onResetSituation, questionBank, onSaveQuestion, onDeleteQuestion, onImportCoachData, venue }) {
  const [coachTab, setCoachTab] = useState('positions');
  const [situationId, setSituationId] = useState(SITUATIONS[0].id);
  const [selectedSlot, setSelectedSlot] = useState('gk');
  const fileInputRef = useRef(null);

  // Question editing state lives here (not inside the form component) so
  // both the field (main column) and the form controls (sidebar) can share
  // it - tapping the field updates context/zones, which the sidebar list
  // reflects immediately, and vice versa.
  const [editingQuestion, setEditingQuestion] = useState(null); // {id, term, prompt, context, zones, isNew} | null
  const [term, setTerm] = useState('');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState([]);
  const [zones, setZones] = useState([]);
  const [markerType, setMarkerType] = useState('ball');
  const [zoneMode, setZoneMode] = useState(false);
  const [zoneCorner, setZoneCorner] = useState(null);

  function startEditing(q) {
    setEditingQuestion(q);
    setTerm(q.term || '');
    setPrompt(q.prompt || '');
    setContext(q.context || []);
    setZones(q.zones || []);
    setMarkerType('ball');
    setZoneMode(false);
    setZoneCorner(null);
  }
  function stopEditing() {
    setEditingQuestion(null);
  }
  function handleAddNewQuestion() {
    startEditing({ id: `custom-${Date.now()}`, term: '', prompt: '', context: [], zones: [], isNew: true });
  }
  function handleSaveQuestion(q) {
    onSaveQuestion(q);
    stopEditing();
  }
  function handleDeleteQuestion(id) {
    onDeleteQuestion(id);
    stopEditing();
  }
  function handleEditFieldTap(pt) {
    if (zoneMode) {
      if (!zoneCorner) {
        setZoneCorner(pt);
      } else {
        const xMin = Math.min(zoneCorner.x, pt.x);
        const xMax = Math.max(zoneCorner.x, pt.x);
        const yMin = Math.min(zoneCorner.y, pt.y);
        const yMax = Math.max(zoneCorner.y, pt.y);
        setZones((prev) => [...prev, { xMin, xMax, yMin, yMax }]);
        setZoneCorner(null);
        setZoneMode(false);
      }
      return;
    }
    if (markerType === 'ball') {
      setContext((prev) => [...prev, { x: pt.x, y: pt.y, render: 'ball', label: 'Ball' }]);
      return;
    }
    if (markerType === 'teammate') {
      // Pick a random roster look at the moment the marker is placed, so it
      // renders as one of the team's own sprites (in the team kit) rather
      // than a generic dot. The pick is locked in on the marker itself, not
      // re-randomized on every render.
      const pick = ROSTER[Math.floor(Math.random() * ROSTER.length)];
      setContext((prev) => [...prev, {
        x: pt.x, y: pt.y, render: 'player',
        shape: pick.shape, colors: pick.colors, eyeRow: pick.eyeRow, mouthRow: pick.mouthRow,
        label: 'Teammate',
      }]);
      return;
    }
    // 'opponent' - renders as the fixed other-team look (blue kit, angry
    // expression) via the existing 'attacker' render branch.
    setContext((prev) => [...prev, { x: pt.x, y: pt.y, render: 'attacker', label: 'OTHER TEAM' }]);
  }

  const overrides = positionData[situationId] || {};
  const positions = {};
  ALL_SLOTS.forEach((slot) => {
    positions[slot.id] = overrides[slot.id] || { x: slot.x, y: slot.y };
  });
  const currentSituation = SITUATIONS.find((s) => s.id === situationId);

  function selectSituation(id) { setSituationId(id); setSelectedSlot('gk'); }
  function handleFieldClick(pct) {
    if (!selectedSlot) return;
    onUpdatePosition(situationId, selectedSlot, pct);
    const idx = SLOT_ORDER.indexOf(selectedSlot);
    setSelectedSlot(SLOT_ORDER[idx + 1] || null);
  }

  function handleExport() {
    const payload = { type: 'pixel-pitch-coach-data', version: 1, positionData, questionBank };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pixel-pitch-coach-data.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0]; e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data?.positionData || !Array.isArray(data?.questionBank)) { window.alert("Invalid export file."); return; }
        if (!window.confirm('Replace current positions and question bank?')) return;
        onImportCoachData(data.positionData, data.questionBank);
      } catch { window.alert('Could not read file.'); }
    };
    reader.readAsText(file);
  }

  const W = 300, H = 440;

  // Switching tabs away from "questions" while mid-edit would leave stale
  // editing state behind; clear it so re-opening Questions starts fresh.
  function switchTab(tab) {
    if (tab !== 'questions') stopEditing();
    setCoachTab(tab);
  }

  return (
    <div className="pp-main">
      {/* Left: field */}
      <div className="pp-field-col">
        {coachTab === 'positions' ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="pp-coach-field" onClick={(e) => {
            const { x, y } = fieldClickToPercent(e, W, H);
            handleFieldClick({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) });
          }}>
            <FieldMarkings W={W} H={H} venue={venue} />
            {FORMATION_2_3_1.map((slot) => {
              const px = (slot.x / 100) * W, py = (slot.y / 100) * H;
              return <circle key={`ref-${slot.id}`} cx={px} cy={py} r="10" fill="none" stroke="var(--field-line)" strokeWidth="1" strokeDasharray="2 2" opacity="0.35" />;
            })}
            {FORMATION_2_3_1.map((slot) => {
              const pos = positions[slot.id];
              const px = (pos.x / 100) * W, py = (pos.y / 100) * H;
              const isSel = selectedSlot === slot.id;
              return (
                <g key={slot.id}>
                  {isSel && <circle cx={px} cy={py} r="20" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />}
                  <circle cx={px} cy={py} r="14" fill={ROLE_COLOR[slot.id]} stroke="var(--bg)" strokeWidth="2" />
                  <text x={px} y={py + 1} className="pp-coach-label">{slot.label}</text>
                </g>
              );
            })}
            {(() => {
              const pos = positions.ball; const px = (pos.x / 100) * W, py = (pos.y / 100) * H;
              const scale = 3;
              return (
                <g>
                  {selectedSlot === 'ball' && <circle cx={px} cy={py} r="18" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />}
                  <g transform={`translate(${px - 4 * scale} ${py - 4 * scale}) scale(${scale})`}>{getBallRects()}</g>
                </g>
              );
            })()}
          </svg>
        ) : editingQuestion ? (
          <EditField context={context} zones={zones} pendingCorner={zoneCorner} onTap={handleEditFieldTap} />
        ) : (
          <div className="pp-field-empty-state">
            <p className="pp-hint">Select a question from the list, or add a new one, to edit it on the field.</p>
          </div>
        )}
      </div>

      {/* Right: sidebar */}
      <div className="pp-sidebar">
        <div className="pp-sidebar-inner">
          <div className="pp-action-bar">
            <button className="pp-btn" onClick={handleExport}><Download size={12} /> EXPORT</button>
            <button className="pp-btn" onClick={() => fileInputRef.current?.click()}><Upload size={12} /> IMPORT</button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
          </div>

          <div className="pp-subtab-row">
            <button className={`pp-subtab${coachTab === 'positions' ? ' active' : ''}`} onClick={() => switchTab('positions')}>POSITIONS</button>
            <button className={`pp-subtab${coachTab === 'questions' ? ' active' : ''}`} onClick={() => switchTab('questions')}>QUESTIONS</button>
          </div>

          {coachTab === 'positions' && (
            <>
              <div className="pp-situation-grid">
                {SITUATIONS.map((sit) => {
                  const count = Object.keys(positionData[sit.id] || {}).length;
                  return (
                    <button key={sit.id} className={`pp-sit-btn${sit.id === situationId ? ' active' : ''}${count === 8 ? ' done' : ''}`} onClick={() => selectSituation(sit.id)}>
                      <span className="pp-sit-group">{sit.group}</span>
                      <span className="pp-sit-side">{sit.side}</span>
                      <span className="pp-sit-progress">{count} / 8</span>
                    </button>
                  );
                })}
              </div>

              <p className="pp-hint">
                {selectedSlot
                  ? <>Tap field to place <b>{ALL_SLOTS.find((s) => s.id === selectedSlot).full}</b> — <b>{currentSituation.group} {currentSituation.side}</b></>
                  : <>All set for <b>{currentSituation.group} — {currentSituation.side}</b>. Tap a chip to adjust.</>}
              </p>

              <div className="pp-chip-row">
                {ALL_SLOTS.map((slot) => (
                  <button key={slot.id} className={`pp-chip${selectedSlot === slot.id ? ' active' : ''}${overrides[slot.id] ? ' set' : ''}`} onClick={() => setSelectedSlot(slot.id)}>
                    {slot.label}
                  </button>
                ))}
              </div>

              <button className="pp-btn" onClick={() => onResetSituation(situationId)}>
                <RotateCcw size={12} /> RESET
              </button>
            </>
          )}

          {coachTab === 'questions' && (
            editingQuestion ? (
              <QuestionEditForm
                term={term} setTerm={setTerm}
                prompt={prompt} setPrompt={setPrompt}
                context={context} setContext={setContext}
                zones={zones} setZones={setZones}
                markerType={markerType} setMarkerType={setMarkerType}
                zoneMode={zoneMode} setZoneMode={setZoneMode}
                zoneCorner={zoneCorner} setZoneCorner={setZoneCorner}
                isNew={!!editingQuestion.isNew}
                questionId={editingQuestion.id}
                onSave={handleSaveQuestion}
                onCancel={stopEditing}
                onDelete={handleDeleteQuestion}
              />
            ) : (
              <QuestionBankList questionBank={questionBank} onEdit={startEditing} onAddNew={handleAddNewQuestion} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   ANSWER FIELD (Match Day)
   Tap-to-answer field. Shows scenario context markers; once locked, reveals
   the correct target/zone (only if the answer was wrong) and the player's
   tap (green if correct, red if not).
   ========================================================================= */

function AnswerField({ context, tap, correct, target, zones, locked, onTap }) {
  const W = 300, H = 440;

  function handleClick(e) {
    if (locked) return;
    const { x, y } = fieldClickToPercent(e, W, H);
    onTap({ x: Math.max(1, Math.min(99, x)), y: Math.max(1, Math.min(99, y)) });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="pp-field-svg pp-coach-field"
      onClick={handleClick}
      role="img"
      aria-label="Tap the field to answer"
    >
      <FieldMarkings W={W} H={H} />
      {context.map((m, i) => renderContextMarker(m, `ctx-${i}`))}

      {locked && !correct && target && (() => {
        const px = (target.x / 100) * W;
        const py = (target.y / 100) * H;
        return <circle cx={px} cy={py} r="16" fill="none" stroke="var(--accent-2)" strokeWidth="3" />;
      })()}

      {locked && !correct && zones && zones.map((z, i) => {
        const x = (z.xMin / 100) * W;
        const y = (z.yMin / 100) * H;
        const w = ((z.xMax - z.xMin) / 100) * W;
        const h = ((z.yMax - z.yMin) / 100) * H;
        return <rect key={`zone-${i}`} x={x} y={y} width={w} height={h} fill="var(--accent-2)" opacity="0.25" stroke="var(--accent-2)" strokeWidth="2" strokeDasharray="4 3" />;
      })}

      {tap && (() => {
        const px = (tap.x / 100) * W;
        const py = (tap.y / 100) * H;
        const color = correct ? 'var(--accent-2)' : '#e63946';
        return (
          <g>
            <line x1={px - 8} y1={py - 8} x2={px + 8} y2={py + 8} stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1={px - 8} y1={py + 8} x2={px + 8} y2={py - 8} stroke={color} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      })()}
    </svg>
  );
}

/* =========================================================================
   FREE KICK MINI-GAME
   3-zone pick (Left/Center/Right). The keeper picks independently and
   randomly; a different zone than the keeper = goal.
   ========================================================================= */

const FK_ZONES = ['L', 'C', 'R'];
const KEEPER_COLORS = { H: '#1f1b24', S: '#d9a066', J: '#ffd166', C: '#1d3557', P: '#1d3557' };

// Stylized keeper: upright with arms spread for a center guess, or tipped
// toward the dive direction (pivoting near the hips) with the near-side arm
// extended and a white glove at the tip for a left/right save attempt.
function DivingKeeper({ direction, cx }) {
  const tx = cx - 18;
  const ty = 16;
  const pivotX = cx;
  const pivotY = ty + 30;
  const angle = direction === 'L' ? -55 : direction === 'R' ? 55 : 0;
  const leftArmX = direction === 'L' ? -16 : -2;
  const leftArmW = direction === 'L' ? 26 : 14;
  const rightArmW = direction === 'R' ? 26 : 14;

  return (
    <g transform={`rotate(${angle} ${pivotX} ${pivotY})`}>
      <ellipse cx={pivotX} cy={pivotY + 3} rx="14" ry="3" fill="#000000" opacity="0.25" transform={`rotate(${-angle} ${pivotX} ${pivotY})`} />
      <g transform={`translate(${tx} ${ty})`}>
        <rect x="10" y="12" width="16" height="18" fill={KEEPER_COLORS.J} />
        <rect x="12" y="30" width="6" height="16" fill={KEEPER_COLORS.P} />
        <rect x="18" y="30" width="6" height="16" fill={KEEPER_COLORS.P} />
        <rect x={leftArmX} y="14" width={leftArmW} height="6" fill={KEEPER_COLORS.S} />
        <rect x="26" y="14" width={rightArmW} height="6" fill={KEEPER_COLORS.S} />
        <rect x={leftArmX - 4} y="14" width="4" height="6" fill="#ffffff" />
        <rect x={26 + rightArmW} y="14" width="4" height="6" fill="#ffffff" />
        {/* Bigger head, drawn over the shoulders */}
        <rect x="9" y="-2" width="18" height="8" fill={KEEPER_COLORS.H} />
        <rect x="9" y="6" width="18" height="10" fill={KEEPER_COLORS.S} />
        {/* Angry eyebrows, slanting down toward the nose */}
        <rect x="11" y="9" width="6" height="2" fill="#1a1a2e" transform="rotate(14 14 10)" />
        <rect x="19" y="9" width="6" height="2" fill="#1a1a2e" transform="rotate(-14 22 10)" />
        {/* Eyes */}
        <rect x="13" y="11" width="2" height="2" fill="#1a1a2e" />
        <rect x="21" y="11" width="2" height="2" fill="#1a1a2e" />
        {/* Scowling mouth */}
        <rect x="12" y="14" width="12" height="2" fill="#3a1f1f" />
      </g>
    </g>
  );
}

function FreeKick({ pick, keeperPick, onPick }) {
  const W = 300, H = 160;
  const zoneW = (W - 20) / 3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp-field-svg" role="img" aria-label="Free kick - pick a side of the goal">
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={`grass-${i}`} x="0" y={i * 20} width={W} height="20" fill={i % 2 === 0 ? 'var(--field-1)' : 'var(--field-2)'} />
      ))}

      {/* Back of the net, with mesh, for a sense of depth */}
      <rect x="40" y="18" width="220" height="52" fill="#16271d" opacity="0.55" />
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`nv${i}`} x1={40 + i * (220 / 6)} y1="18" x2={40 + i * (220 / 6)} y2="70" stroke="#ffffff" strokeWidth="0.6" opacity="0.3" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`nh${i}`} x1="40" y1={18 + i * (52 / 4)} x2="260" y2={18 + i * (52 / 4)} stroke="#ffffff" strokeWidth="0.6" opacity="0.3" />
      ))}
      <path d="M 40 70 L 40 18 L 260 18 L 260 70" fill="none" stroke="#e8e8e8" strokeWidth="2" />

      {/* Depth lines connecting the goal mouth to the back of the net */}
      <line x1="10" y1="10" x2="40" y2="18" stroke="#ffffff" strokeWidth="2.5" />
      <line x1="290" y1="10" x2="260" y2="18" stroke="#ffffff" strokeWidth="2.5" />
      <line x1="10" y1="90" x2="40" y2="70" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
      <line x1="290" y1="90" x2="260" y2="70" stroke="#ffffff" strokeWidth="2" opacity="0.7" />

      {/* Goal mouth - posts and crossbar */}
      <path d="M 10 90 L 10 10 L 290 10 L 290 90" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinejoin="round" />

      <line x1={10 + zoneW} y1="10" x2={10 + zoneW} y2="90" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <line x1={10 + 2 * zoneW} y1="10" x2={10 + 2 * zoneW} y2="90" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

      {!pick && FK_ZONES.map((z, i) => (
        <rect key={z} x={10 + i * zoneW} y="10" width={zoneW} height="80" fill="transparent" className="pp-fk-zone" onClick={() => onPick(z)} />
      ))}

      {keeperPick && (() => {
        const i = FK_ZONES.indexOf(keeperPick);
        const cx = 10 + i * zoneW + zoneW / 2;
        return <DivingKeeper direction={keeperPick} cx={cx} />;
      })()}

      {pick && (() => {
        const i = FK_ZONES.indexOf(pick);
        const cx = 10 + i * zoneW + zoneW / 2;
        const cy = pick === keeperPick ? 40 : 80;
        const scale = 2.5;
        return <g transform={`translate(${cx - 4 * scale} ${cy - 4 * scale}) scale(${scale})`}>{getBallRects()}</g>;
      })()}
    </svg>
  );
}

/* =========================================================================
   CELEBRATION EFFECTS - confetti, a synthesized goal fanfare, and a
   "raise your arms" dance overlay for the winning lineup.
   ========================================================================= */

const CONFETTI_COLORS = ['#ffd166', '#06d6a0', '#e63946', '#48cae4', '#ffffff', '#f3722c'];

function Confetti({ count = 24 }) {
  const pieces = Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 1.6 + Math.random() * 1.4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }));
  return (
    <div className="pp-confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="pp-confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// Short synthesized fanfare - no external audio assets needed. Safe to call
// from any user-gesture handler (tap to take the free kick, etc.).
function playGoalSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const start = now + i * 0.1;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Audio not available - fail silently.
  }
}

// Original 8-bit-style intro song - a full ~9.5 second composed piece
// (not a short repeating loop) that plays through pickup -> hook -> hook
// variation -> contrasting bridge -> final cadence, then repeats from the
// top if nobody has picked an option yet. Returns a controller object
// with stop(); the intro screen calls stop() the moment the player picks
// an option, and on unmount as a safety net.
function startIntroTheme() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return { stop() {} };

  let ctx;
  try {
    ctx = new Ctx();
  } catch {
    return { stop() {} };
  }

  let stopped = false;
  let timerId = null;

  // C major scale across a couple octaves, plus the root notes used in the
  // bass line below (A3/F3/G3/C4 for a I-vi-IV-V-flavored progression).
  const N = {
    D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
    C6: 1046.50,
    C4: 261.63, A3: 220.00, F3: 174.61, G3: 196.00,
  };
  const STEP = 0.25; // eighth-note grid, seconds
  const SONG_LEN = 9.5; // full piece length before it loops back to the top

  function note(freq, start, dur, type, vol) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  // Lead melody, written on the STEP grid (each entry is [note, numSteps]).
  // null = rest. Structure: pickup -> A -> A' (reaches higher) -> B
  // (lower register, bouncier contrast) -> tag (big finish, holds the
  // tonic at the end so the loop point doesn't feel abrupt).
  const LEAD = [
    // pickup (4 steps)
    ['G4', 1], ['A4', 1], ['B4', 1], ['C5', 1],
    // A (8 steps)
    ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['F5', 1], ['D5', 1], ['G5', 1], ['E5', 1],
    // A' (8 steps) - same shape, reaches higher
    ['C5', 1], ['E5', 1], ['G5', 1], ['C6', 1], ['A5', 1], ['F5', 1], ['E5', 1], ['D5', 1],
    // B (8 steps) - lower register, bouncier, deliberate contrast
    ['G4', 1], [null, 1], ['A4', 1], ['G4', 1], ['F4', 1], [null, 1], ['E4', 1], ['D4', 1],
    // tag (10 steps) - final flourish, holds the tonic
    ['E5', 1], ['G5', 1], ['C6', 1], ['G5', 1], ['E5', 1], ['D5', 1], ['C5', 4],
  ];

  // Bass line - one root note per bar (mostly), following the same
  // pickup/A/A'/B/tag structure so it lands on the chord the melody implies.
  const BASS = [
    ['C4', 0, 4],
    ['C4', 4, 4], ['A3', 8, 4],
    ['F3', 12, 4], ['G3', 16, 4],
    ['C4', 20, 4], ['A3', 24, 4],
    ['F3', 28, 4], ['C4', 32, 6],
  ];

  function scheduleSong() {
    if (stopped) return;
    const base = ctx.currentTime;

    let t = 0;
    LEAD.forEach(([name, steps]) => {
      if (name) note(N[name], base + t * STEP, steps * STEP * 0.92, 'square', 0.15);
      t += steps;
    });

    BASS.forEach(([name, startStep, steps]) => {
      note(N[name], base + startStep * STEP, steps * STEP * 0.9, 'triangle', 0.10);
    });

    timerId = setTimeout(scheduleSong, SONG_LEN * 1000);
  }

  scheduleSong();

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      if (timerId) clearTimeout(timerId);
      try { ctx.close(); } catch {}
    },
  };
}

// A player sprite with small arm overlays that bob up and down, for the
// post-win celebration.
function CelebratingPlayer({ player, size = 44, delay = 0, kit = kitColors }) {
  const colors = kit(player.colors);
  return (
    <svg viewBox="0 0 12 16" width={size} height={(size * 16) / 12} shapeRendering="crispEdges">
      {getSpriteRects(player.shape, colors, player.eyeRow, player.mouthRow)}
      <rect className="pp-dance-arm" x="0.5" y="11" width="1.5" height="3" fill={colors.S} style={{ animationDelay: `${delay}s` }} />
      <rect className="pp-dance-arm" x="10" y="11" width="1.5" height="3" fill={colors.S} style={{ animationDelay: `${delay}s` }} />
    </svg>
  );
}

// A row of distinct, randomly-picked roster looks, all dancing in either
// the home (red) or away (blue) kit - used on the intro screen so both
// "teams" are out on the pitch while the title music plays. Each player's
// own hairstyle/expression stays intact; only the kit color changes.
// The random pick + per-player animation delay are computed once via
// useState's lazy initializer, so they don't reshuffle on every render.
function DancingRow({ count, kit, reverseDelay = false }) {
  const [players] = useState(() => {
    const pool = [...ROSTER];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  });
  return (
    <div className="pp-dance-row">
      {players.map((p, i) => (
        <CelebratingPlayer
          key={p.id}
          player={p}
          size={40}
          delay={reverseDelay ? (count - i) * 0.07 : i * 0.07}
          kit={kit}
        />
      ))}
    </div>
  );
}

/* =========================================================================
   EXTREME MODE
   A harder, all-in-one drill: pick a random situation (e.g. "Corner Kick -
   Attack"), then place the ball AND every one of the 7 players, one at a
   time, with no on-field reference markers showing where anyone else
   should be (unlike Match Day's position questions, which always show
   everyone else lined up correctly as context). Ends with a single
   8-for-8 style result rather than feeding into the match score/streak/
   free-kick loop, since the whole point is a focused, harder rep.
   ========================================================================= */

// Bursting fireworks for the Extreme Mode champion screen - same CSS-driven
// approach as Confetti (no canvas/images needed), but radial particle
// bursts instead of falling pieces, each burst on a stagger so the screen
// keeps popping rather than firing all at once and going dark.
const FIREWORK_COLORS = ['#ffd166', '#06d6a0', '#e63946', '#48cae4', '#f1faee', '#9d4edd'];
function Fireworks({ count = 6 }) {
  const bursts = Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: 10 + Math.random() * 80,
    top: 8 + Math.random() * 55,
    delay: i * 0.5 + Math.random() * 0.3,
    color: FIREWORK_COLORS[i % FIREWORK_COLORS.length],
  }));
  return (
    <div className="pp-fireworks" aria-hidden="true">
      {bursts.map((b) => (
        <span
          key={b.id}
          className="pp-firework-burst"
          style={{ left: `${b.left}%`, top: `${b.top}%`, animationDelay: `${b.delay}s` }}
        >
          {Array.from({ length: 10 }).map((_, j) => (
            <span
              key={j}
              className="pp-firework-spark"
              style={{
                backgroundColor: b.color,
                '--rot': `${j * 36}deg`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </span>
      ))}
    </div>
  );
}

// Looping victory fanfare for the champion screen - faster and brighter
// than the intro theme, with a punchy repeated "ta-da" character. Same
// controller pattern as startIntroTheme (stop() cancels the loop and
// closes the audio context).
function startChampionFanfare() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return { stop() {} };

  let ctx;
  try {
    ctx = new Ctx();
  } catch {
    return { stop() {} };
  }

  let stopped = false;
  let timerId = null;

  const N = {
    C3: 130.81, G3: 196.00,
    C4: 261.63, E4: 329.63, G4: 392.00,
    C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.50,
  };
  const STEP = 0.16;
  const LOOP_LEN = 8 * STEP; // 1.28s - short, punchy, repeats fast

  function note(freq, start, dur, type, vol) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  const LEAD = [
    ['C5', 1], ['E5', 1], ['G5', 1], ['C6', 1], ['G5', 1], ['E5', 1], ['C6', 2],
  ];

  function scheduleLoop() {
    if (stopped) return;
    const base = ctx.currentTime;
    let t = 0;
    LEAD.forEach(([name, steps]) => {
      note(N[name], base + t * STEP, steps * STEP * 0.9, 'square', 0.17);
      t += steps;
    });
    note(N.C3, base, STEP * 8 * 0.85, 'triangle', 0.13);
    note(N.G3, base + 4 * STEP, STEP * 4 * 0.85, 'triangle', 0.1);
    timerId = setTimeout(scheduleLoop, LOOP_LEN * 1000);
  }

  scheduleLoop();

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      if (timerId) clearTimeout(timerId);
      try { ctx.close(); } catch {}
    },
  };
}

/* =========================================================================
   CHAMPION SCREEN
   The big payoff for clearing all 8 Extreme Mode situations: huge title,
   the whole squad dancing on screen, fireworks, and a looping victory
   fanfare. Music starts the instant this mounts and stops the instant it
   unmounts (mode exited/restarted), same lifecycle pattern as the intro
   screen's theme song.
   ========================================================================= */

function ChampionScreen({ assignments, onPlayAgain, onExit }) {
  const themeRef = useRef(null);

  useEffect(() => {
    themeRef.current = startChampionFanfare();
    return () => {
      if (themeRef.current) themeRef.current.stop();
    };
  }, []);

  function handleSelect(action) {
    if (themeRef.current) {
      themeRef.current.stop();
      themeRef.current = null;
    }
    action();
  }

  const dancers = FORMATION_2_3_1.map((slot) => findPlayer(assignments[slot.id])).filter(Boolean);

  return (
    <div className="pp-champion">
      <Fireworks count={7} />
      <h1 className="pp-pixel pp-champion-title">SOCCER<br />STRATEGY<br />MASTER</h1>
      <p className="pp-champion-sub">All 8 situations. Every position. Zero excuses.</p>
      <div className="pp-celebration pp-champion-squad">
        {dancers.map((player, i) => (
          <CelebratingPlayer key={player.id} player={player} size={56} delay={i * 0.07} />
        ))}
      </div>
      <div className="pp-intro-actions pp-champion-actions">
        <button className="pp-btn primary full" onClick={() => handleSelect(onPlayAgain)}>PLAY AGAIN</button>
        <button className="pp-btn full" onClick={() => handleSelect(onExit)}>BACK TO MATCH</button>
      </div>
    </div>
  );
}

function ExtremeModeScreen({ assignments, positionData, venue, onExit }) {
  const W = 300, H = 440;
  const MAX_MISTAKES = 3;
  // Ball is auto-placed (shown correctly from the start of every
  // situation) - only the 7 outfield/GK slots are actually placed by the
  // player, and ALL 7 must be correct before the situation counts as
  // mastered and the run advances to the next one.
  const PLACEMENT_ORDER = ['gk', 'lb', 'rb', 'lm', 'cm', 'rm', 'st'];

  function shuffledSituations() {
    const arr = [...SITUATIONS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const [queue, setQueue] = useState(shuffledSituations);
  const [situationIndex, setSituationIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [placedCorrect, setPlacedCorrect] = useState([]); // slot ids mastered this situation
  const [mistakes, setMistakes] = useState(0);
  const [tap, setTap] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [phase, setPhase] = useState('placing'); // 'placing' | 'feedback' | 'situation_clear' | 'gameover' | 'champion'

  const situation = queue[situationIndex];
  const overrides = positionData[situation.id] || {};
  const ballPos = overrides.ball || { x: BALL_SLOT.x, y: BALL_SLOT.y };
  const currentSlotId = PLACEMENT_ORDER[stepIndex];
  const currentSlot = ALL_SLOTS.find((s) => s.id === currentSlotId);
  const target = overrides[currentSlotId] || { x: currentSlot.x, y: currentSlot.y };
  const player = findPlayer(assignments[currentSlotId]);
  const subjectLabel = player ? `${player.name} (${currentSlot.full})` : currentSlot.full;
  const livesLeft = MAX_MISTAKES - mistakes;

  function handleFieldTap(pt) {
    if (phase !== 'placing') return;
    const dx = Math.abs(pt.x - target.x);
    const dy = Math.abs(pt.y - target.y);
    const ok = dx <= 18 && dy <= 13;
    setTap(pt);
    setCorrect(ok);

    if (ok) {
      setPhase('feedback');
      setPlacedCorrect((prev) => [...prev, currentSlotId]);
    } else {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setPhase(nextMistakes >= MAX_MISTAKES ? 'gameover' : 'feedback');
    }
  }

  function handleNextStep() {
    const isLastSlot = stepIndex + 1 >= PLACEMENT_ORDER.length;
    setTap(null);
    setCorrect(null);
    if (isLastSlot) {
      const isLastSituation = situationIndex + 1 >= queue.length;
      setPhase(isLastSituation ? 'champion' : 'situation_clear');
    } else {
      setStepIndex((i) => i + 1);
      setPhase('placing');
    }
  }

  function handleRetrySlot() {
    // A wrong placement doesn't lose progress on the slots already
    // mastered this situation - just try the same slot again, same as
    // before, just costing one of the shared 3 mistakes.
    setTap(null);
    setCorrect(null);
    setPhase('placing');
  }

  function handleContinueToNextSituation() {
    setSituationIndex((i) => i + 1);
    setStepIndex(0);
    setPlacedCorrect([]);
    setTap(null);
    setCorrect(null);
    setPhase('placing');
  }

  function handleRestartRun() {
    setQueue(shuffledSituations());
    setSituationIndex(0);
    setStepIndex(0);
    setPlacedCorrect([]);
    setMistakes(0);
    setTap(null);
    setCorrect(null);
    setPhase('placing');
  }

  // Ball marker is always shown (auto-placed); placed-correct players are
  // added as they're mastered this situation. Nobody not-yet-placed shows,
  // which is what keeps this harder than the regular Match Day questions.
  const fieldMarkers = [
    { x: ballPos.x, y: ballPos.y, render: 'ball', label: 'Ball' },
    ...placedCorrect.map((slotId) => {
      const slot = ALL_SLOTS.find((s) => s.id === slotId);
      const pos = overrides[slotId] || { x: slot.x, y: slot.y };
      const pl = findPlayer(assignments[slotId]);
      return { x: pos.x, y: pos.y, render: 'player', shape: pl.shape, colors: pl.colors, eyeRow: pl.eyeRow, mouthRow: pl.mouthRow, label: slot.label };
    }),
  ];

  const showField = phase === 'placing' || phase === 'feedback';

  if (phase === 'champion') {
    return <ChampionScreen assignments={assignments} onPlayAgain={handleRestartRun} onExit={onExit} />;
  }

  return (
    <div className="pp-main">
      <div className="pp-field-col">
        {phase === 'gameover' ? (
          <div className="pp-field-empty-state">
            <div className="pp-xm-summary">
              <h2 className="pp-pixel" style={{ color: '#e63946' }}>GAME OVER</h2>
              <p className="pp-hint">3 wrong placements - that's the limit.</p>
              <p className="pp-hint">
                You made it through <b>{situationIndex}</b> of <b>{queue.length}</b> situations
                {situationIndex < queue.length ? <> and got <b>{placedCorrect.length}</b>/{PLACEMENT_ORDER.length} of the way through {situation.group} — {situation.side}</> : ''}.
              </p>
            </div>
          </div>
        ) : phase === 'situation_clear' ? (
          <div className="pp-field-empty-state">
            <div className="pp-xm-summary">
              <h2 className="pp-pixel" style={{ color: 'var(--accent-2)' }}>SITUATION MASTERED!</h2>
              <p className="pp-hint">{situation.group} — {situation.side}: all 7 positions correct.</p>
              <p className="pp-hint">{queue.length - situationIndex - 1} situation(s) to go.</p>
            </div>
          </div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="pp-coach-field" onClick={(e) => {
            if (phase === 'feedback') return;
            const { x, y } = fieldClickToPercent(e, W, H);
            handleFieldTap({ x: Math.max(1, Math.min(99, x)), y: Math.max(1, Math.min(99, y)) });
          }}>
            <FieldMarkings W={W} H={H} venue={venue} />
            {fieldMarkers.map((m, i) => renderContextMarker(m, `placed-${i}`))}
            {tap && (() => {
              const px = (tap.x / 100) * W, py = (tap.y / 100) * H;
              const color = correct ? 'var(--accent-2)' : '#e63946';
              return (
                <g>
                  <line x1={px-8} y1={py-8} x2={px+8} y2={py+8} stroke={color} strokeWidth="3" strokeLinecap="round" />
                  <line x1={px-8} y1={py+8} x2={px+8} y2={py-8} stroke={color} strokeWidth="3" strokeLinecap="round" />
                </g>
              );
            })()}
            {phase === 'feedback' && !correct && (() => {
              const px = (target.x / 100) * W, py = (target.y / 100) * H;
              return <circle cx={px} cy={py} r="16" fill="none" stroke="var(--accent-2)" strokeWidth="3" />;
            })()}
          </svg>
        )}
      </div>

      <div className="pp-sidebar">
        <div className="pp-sidebar-inner">
          <div className="pp-xm-header">
            <span className="pp-pixel" style={{ color: 'var(--accent)', fontSize: '11px' }}>⚠ EXTREME MODE</span>
            <button className="pp-btn" onClick={onExit}>EXIT</button>
          </div>

          {phase !== 'gameover' && (
            <p className="pp-xm-lives">
              SITUATION {situationIndex + 1} / {queue.length} &middot; MISTAKES LEFT:{' '}
              {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                <span key={i} className={`pp-xm-life${i < livesLeft ? '' : ' used'}`}>⚽</span>
              ))}
            </p>
          )}

          {showField && (
            <>
              <p className="pp-hint">
                <b>{situation.group} — {situation.side}</b> &middot; position {stepIndex + 1} / {PLACEMENT_ORDER.length}
              </p>
              <p className="pp-question-prompt">
                Place {subjectLabel}. No reference markers — you've got this.
              </p>
              {phase === 'placing' && <p className="pp-hint" style={{ color: 'var(--accent)', fontSize: '11px' }}>👆 Tap the field to place</p>}
              {phase === 'feedback' && correct && (
                <div className="pp-result-panel">
                  <h2 className="pp-correct">CORRECT!</h2>
                  <button className="pp-btn primary full" onClick={handleNextStep}>
                    {stepIndex + 1 >= PLACEMENT_ORDER.length ? 'CONTINUE' : 'NEXT PLAYER'}
                  </button>
                </div>
              )}
            </>
          )}

          {phase === 'feedback' && !correct && (
            <div className="pp-result-panel">
              <h2 className="pp-incorrect">NOT QUITE</h2>
              <p className="pp-hint">{livesLeft} mistake(s) left before it's game over.</p>
              <button className="pp-btn primary full" onClick={handleRetrySlot}>TRY AGAIN</button>
            </div>
          )}

          {phase === 'situation_clear' && (
            <div className="pp-result-panel">
              <button className="pp-btn primary full" onClick={handleContinueToNextSituation}>NEXT SITUATION →</button>
            </div>
          )}

          {phase === 'gameover' && (
            <div className="pp-result-panel">
              <button className="pp-btn primary full" onClick={handleRestartRun}>TRY AGAIN</button>
              <button className="pp-btn full" onClick={onExit}>BACK TO MATCH</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MATCH DAY SCREEN
   ========================================================================= */

function MatchScreen({ assignments, positionData, questionBank, venue, onMatchComplete, record, newlyUnlocked, onDismissUnlock }) {
  const [score, setScore] = useState({ us: 0, them: 0 });
  const [streak, setStreak] = useState(0);
  const [minutesElapsed, setMinutesElapsed] = useState(0);
  const [question, setQuestion] = useState(() => generateQuestion(assignments, positionData, questionBank));
  const [usedKeys, setUsedKeys] = useState(() => [question.key]);
  const [tap, setTap] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [phase, setPhase] = useState('question'); // 'question' | 'feedback' | 'freekick' | 'fulltime'
  const [pendingFreeKick, setPendingFreeKick] = useState(false);
  const [opponentScored, setOpponentScored] = useState(false);
  const [freekick, setFreekick] = useState({ pick: null, keeperPick: null });

  function handleTap(pt) {
    const ok = checkAnswer(question, pt);
    setTap(pt);
    setCorrect(ok);
    setPhase('feedback');
    setOpponentScored(false);
    setMinutesElapsed((m) => Math.min(90, m + 5));
    if (ok) {
      const next = streak + 1;
      if (next >= 3) {
        setStreak(0);
        setPendingFreeKick(true);
      } else {
        setStreak(next);
        setPendingFreeKick(false);
      }
    } else {
      setStreak(0);
      setPendingFreeKick(false);
      if (Math.random() < 0.25) {
        setScore((s) => ({ ...s, them: s.them + 1 }));
        setOpponentScored(true);
      }
    }
  }

  function nextQuestion() {
    let q = generateQuestion(assignments, positionData, questionBank);
    let attempts = 0;
    while (usedKeys.includes(q.key) && attempts < 200) {
      q = generateQuestion(assignments, positionData, questionBank);
      attempts++;
    }
    setQuestion(q);
    setUsedKeys((prev) => [...prev, q.key]);
    setTap(null);
    setCorrect(null);
    setOpponentScored(false);
    setPhase('question');
  }

  function proceedAfterFeedback() {
    if (minutesElapsed >= 90) {
      setPhase('fulltime');
      if (score.us > score.them) playGoalSound();
      if (onMatchComplete) {
        const result = score.us > score.them ? 'win' : score.us < score.them ? 'loss' : 'draw';
        onMatchComplete(result);
      }
    } else {
      nextQuestion();
    }
  }

  function handleContinue() {
    if (pendingFreeKick) {
      setPendingFreeKick(false);
      setFreekick({ pick: null, keeperPick: null });
      setPhase('freekick');
      return;
    }
    proceedAfterFeedback();
  }

  function handleFreeKickPick(zone) {
    if (freekick.pick) return;
    const keeper = FK_ZONES[Math.floor(Math.random() * 3)];
    const goal = zone !== keeper;
    setFreekick({ pick: zone, keeperPick: keeper });
    if (goal) {
      setScore((s) => ({ ...s, us: s.us + 1 }));
      playGoalSound();
    }
  }

  function handleRestart() {
    setScore({ us: 0, them: 0 });
    setStreak(0);
    setMinutesElapsed(0);
    setPendingFreeKick(false);
    setOpponentScored(false);
    setFreekick({ pick: null, keeperPick: null });
    setTap(null);
    setCorrect(null);
    if (onDismissUnlock) onDismissUnlock();
    const q = generateQuestion(assignments, positionData, questionBank);
    setQuestion(q);
    setUsedKeys([q.key]);
    setPhase('question');
  }

  const W = 300, H = 440;
  const isGoal = freekick.pick && freekick.pick !== freekick.keeperPick;

  return (
    <div className="pp-main">
      {/* Left: field or free kick */}
      {phase === 'freekick' ? (
        <div className="pp-fk-col">
          <svg viewBox="0 0 300 160" role="img" aria-label="Free kick - pick a side">
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={`grass-${i}`} x="0" y={i * 20} width="300" height="20" fill={i % 2 === 0 ? 'var(--field-1)' : 'var(--field-2)'} />
            ))}
            <rect x="40" y="18" width="220" height="52" fill="#16271d" opacity="0.55" />
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`nv${i}`} x1={40 + i * (220/6)} y1="18" x2={40 + i * (220/6)} y2="70" stroke="#ffffff" strokeWidth="0.6" opacity="0.3" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`nh${i}`} x1="40" y1={18 + i * (52/4)} x2="260" y2={18 + i * (52/4)} stroke="#ffffff" strokeWidth="0.6" opacity="0.3" />
            ))}
            <path d="M 40 70 L 40 18 L 260 18 L 260 70" fill="none" stroke="#e8e8e8" strokeWidth="2" />
            <line x1="10" y1="10" x2="40" y2="18" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="290" y1="10" x2="260" y2="18" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="10" y1="90" x2="40" y2="70" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
            <line x1="290" y1="90" x2="260" y2="70" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
            <path d="M 10 90 L 10 10 L 290 10 L 290 90" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinejoin="round" />
            {FK_ZONES.map((z, i) => {
              const zoneW = (300 - 20) / 3;
              return (
                <line key={z} x1={10 + (i + 1) * zoneW} y1="10" x2={10 + (i + 1) * zoneW} y2="90" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              );
            }).slice(0, 2)}
            {!freekick.pick && FK_ZONES.map((z, i) => {
              const zoneW = (300 - 20) / 3;
              return <rect key={z} x={10 + i * zoneW} y="10" width={zoneW} height="80" fill="transparent" className="pp-fk-zone" onClick={() => handleFreeKickPick(z)} />;
            })}
            {freekick.keeperPick && (() => {
              const zoneW = (300 - 20) / 3;
              const i = FK_ZONES.indexOf(freekick.keeperPick);
              const cx = 10 + i * zoneW + zoneW / 2;
              return <DivingKeeper direction={freekick.keeperPick} cx={cx} />;
            })()}
            {freekick.pick && (() => {
              const zoneW = (300 - 20) / 3;
              const i = FK_ZONES.indexOf(freekick.pick);
              const cx = 10 + i * zoneW + zoneW / 2;
              const cy = freekick.pick === freekick.keeperPick ? 40 : 80;
              const scale = 2.5;
              return <g transform={`translate(${cx - 4 * scale} ${cy - 4 * scale}) scale(${scale})`}>{getBallRects()}</g>;
            })()}
          </svg>
        </div>
      ) : phase === 'fulltime' ? (
        <div className="pp-fk-col">
          {score.us > score.them && <Confetti count={48} />}
          {score.us > score.them && (
            <div className="pp-celebration">
              {FORMATION_2_3_1.map((slot, i) => {
                const player = findPlayer(assignments[slot.id]);
                if (!player) return null;
                return <CelebratingPlayer key={slot.id} player={player} size={52} delay={i * 0.08} />;
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="pp-field-col">
          <svg viewBox={`0 0 ${W} ${H}`} className="pp-coach-field" onClick={(e) => {
            if (phase === 'feedback') return;
            const { x, y } = fieldClickToPercent(e, W, H);
            handleTap({ x: Math.max(1, Math.min(99, x)), y: Math.max(1, Math.min(99, y)) });
          }}>
            <FieldMarkings W={W} H={H} venue={venue} />
            {question.context && question.context.map((m, i) => renderContextMarker(m, `ctx-${i}`))}
            {tap && (() => {
              const px = (tap.x / 100) * W, py = (tap.y / 100) * H;
              const color = correct ? 'var(--accent-2)' : '#e63946';
              return (
                <g>
                  <line x1={px-8} y1={py-8} x2={px+8} y2={py+8} stroke={color} strokeWidth="3" strokeLinecap="round" />
                  <line x1={px-8} y1={py+8} x2={px+8} y2={py-8} stroke={color} strokeWidth="3" strokeLinecap="round" />
                </g>
              );
            })()}
            {phase === 'feedback' && !correct && question.target && (() => {
              const px = (question.target.x / 100) * W, py = (question.target.y / 100) * H;
              return <circle cx={px} cy={py} r="16" fill="none" stroke="var(--accent-2)" strokeWidth="3" />;
            })()}
            {phase === 'feedback' && !correct && question.zones && question.zones.map((z, i) => {
              const x = (z.xMin / 100) * W, y = (z.yMin / 100) * H;
              const w = ((z.xMax - z.xMin) / 100) * W, h = ((z.yMax - z.yMin) / 100) * H;
              return <rect key={i} x={x} y={y} width={w} height={h} fill="var(--accent-2)" opacity="0.25" stroke="var(--accent-2)" strokeWidth="2" strokeDasharray="4 3" />;
            })}
          </svg>
        </div>
      )}

      {/* Right: sidebar */}
      <div className="pp-sidebar">
        <div className="pp-sidebar-inner">
          {/* Scoreboard */}
          <div className="pp-scoreboard">
            <div className="pp-score-side">
              <span className="pp-score-label pp-pixel">US</span>
              <span className="pp-score-num">{score.us}</span>
            </div>
            <div className="pp-streak">
              {[1,2,3].map((i) => <span key={i} className={`pp-streak-dot${i <= streak ? ' on' : ''}`} />)}
            </div>
            <div className="pp-score-side">
              <span className="pp-score-label pp-pixel">THEM</span>
              <span className="pp-score-num">{score.them}</span>
            </div>
          </div>

          {/* Clock */}
          <div className="pp-clock">
            <div className="pp-clock-bar">
              <div className={`pp-clock-fill${minutesElapsed >= 90 ? ' full' : ''}`} style={{ width: `${(minutesElapsed / 90) * 100}%` }} />
            </div>
            <span className="pp-clock-label">{minutesElapsed}' / 90'</span>
          </div>

          <hr className="pp-divider" />

          {/* Full time */}
          {phase === 'fulltime' && (
            <div className="pp-result-panel">
              {score.us > score.them && <Confetti count={32} />}
              <h2 className="pp-pixel" style={{ color: 'var(--accent-2)' }}>FULL TIME</h2>
              <span className="pp-final-score">{score.us} – {score.them}</span>
              <p>
                {score.us > score.them ? 'You won the match!' : score.us < score.them ? "Tough one — let's run it back." : "It's a draw!"}
              </p>
              {score.us > score.them && newlyUnlocked && (() => {
                const newPlayer = UNLOCKABLE_ROSTER.find((p) => p.id === newlyUnlocked);
                if (!newPlayer) return null;
                return (
                  <div className="pp-unlock-banner">
                    <p className="pp-pixel pp-unlock-title">NEW PLAYER UNLOCKED!</p>
                    <PixelSprite shape={newPlayer.shape} colors={kitColors(newPlayer.colors)} eyeRow={newPlayer.eyeRow} mouthRow={newPlayer.mouthRow} size={64} />
                    <p className="pp-unlock-name">{newPlayer.name}</p>
                    <p className="pp-unlock-tag">{newPlayer.tag}</p>
                    <p className="pp-hint">Find them on the bench in Squad.</p>
                  </div>
                );
              })()}
              {record && (
                <p className="pp-intro-record">
                  ALL-TIME RECORD: <span className="pp-record-w">{record.wins}W</span>
                  {' '}<span className="pp-record-l">{record.losses}L</span>
                  {' '}<span className="pp-record-d">{record.draws}D</span>
                </p>
              )}
              <button className="pp-btn primary full" onClick={handleRestart}>PLAY AGAIN</button>
            </div>
          )}

          {/* Question phase */}
          {phase !== 'freekick' && phase !== 'fulltime' && (
            <>
              <p className="pp-question-prompt">
                {question.type === 'terminology' && question.term && <b>{question.term}: </b>}
                {question.prompt}
              </p>
              {phase === 'question' && <p className="pp-hint" style={{ color: 'var(--accent)', fontSize: '11px' }}>👆 Tap the field to answer</p>}
              {phase === 'feedback' && (
                <div className="pp-result-panel">
                  <h2 className={correct ? 'pp-correct' : 'pp-incorrect'}>{correct ? 'CORRECT!' : 'NOT QUITE'}</h2>
                  {opponentScored && <p className="pp-opponent-score">Unmarked space — they score!</p>}
                  {pendingFreeKick && <p>3 in a row! Free kick earned.</p>}
                  <button className="pp-btn primary full" onClick={handleContinue}>
                    {pendingFreeKick ? 'TAKE FREE KICK' : 'NEXT QUESTION'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Free kick phase */}
          {phase === 'freekick' && (
            <>
              <p className="pp-hint">{freekick.pick ? '' : 'Pick a side of the goal.'}</p>
              <div className="pp-chip-row" style={{ justifyContent: 'center' }}>
                {!freekick.pick && FK_ZONES.map((z) => (
                  <button key={z} className="pp-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleFreeKickPick(z)}>
                    {z === 'L' ? '← LEFT' : z === 'R' ? 'RIGHT →' : 'CENTER'}
                  </button>
                ))}
              </div>
              {freekick.pick && (
                <div className="pp-result-panel">
                  {isGoal && <Confetti count={24} />}
                  <h2 className={isGoal ? 'pp-correct' : 'pp-incorrect'}>{isGoal ? 'GOAL!' : 'SAVED!'}</h2>
                  <button className="pp-btn primary full" onClick={proceedAfterFeedback}>NEXT QUESTION</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   INTRO SCREEN
   Title screen with two entry paths (pick a new squad, or jump straight
   into a match with whatever squad is already saved) plus an original
   chiptune fanfare. The Coach tab is intentionally not offered here - it's
   reachable only via the small link tucked in the corner, once inside the
   app, so it stays out of the way for kids just picking teams and playing.
   ========================================================================= */

function IntroScreen({ teamName, hasFullSquad, record, onPickTeam, onPlayMatch, onQuickStart, onPlayExtreme }) {
  const themeRef = useRef(null);
  const gamesPlayed = record.wins + record.losses + record.draws;

  useEffect(() => {
    themeRef.current = startIntroTheme();
    return () => {
      if (themeRef.current) themeRef.current.stop();
    };
  }, []);

  function handleSelect(action) {
    if (themeRef.current) {
      themeRef.current.stop();
      themeRef.current = null;
    }
    action();
  }

  return (
    <div className="pp-intro">
      <div className="pp-intro-content">
        <DancingRow count={4} kit={kitColors} />

        <div className="pp-intro-card">
          <div className="pp-intro-balls">
            <PixelBall size={40} />
            <PixelBall size={40} />
          </div>
          <h1 className="pp-pixel pp-intro-title">PIXEL PITCH FC</h1>
          <p className="pp-intro-welcome">Welcome to Pixel Pitch FC!</p>
          <p className="pp-hint">Learn positions and soccer terms, then take it to Match Day.</p>
          {gamesPlayed > 0 && (
            <p className="pp-intro-record">
              ALL-TIME RECORD: <span className="pp-record-w">{record.wins}W</span>
              {' '}<span className="pp-record-l">{record.losses}L</span>
              {' '}<span className="pp-record-d">{record.draws}D</span>
            </p>
          )}

          <div className="pp-intro-actions">
            <button className="pp-btn primary full" onClick={() => handleSelect(onQuickStart)}>
              ⚡ QUICK START (RANDOM TEAM)
            </button>
            <button className="pp-btn full" onClick={() => handleSelect(onPickTeam)}>
              CREATE A TEAM
            </button>
            <button
              className="pp-btn full"
              disabled={!hasFullSquad}
              onClick={() => handleSelect(onPlayMatch)}
              title={hasFullSquad ? `Play as ${teamName}` : 'Pick a full squad first'}
            >
              {hasFullSquad ? `PLAY AS ${teamName}` : 'PLAY MATCH (PICK A SQUAD FIRST)'}
            </button>
            {hasFullSquad && (
              <button className="pp-btn full pp-btn-extreme" onClick={() => handleSelect(onPlayExtreme)}>
                ⚠ EXTREME MODE
              </button>
            )}
          </div>
        </div>

        <DancingRow count={4} kit={awayKitColors} reverseDelay />
      </div>
    </div>
  );
}

/* =========================================================================
   CREATE A TEAM: STEP 1 - TEAM NAME
   First step of the "Create a Team" flow (Intro -> Name -> Squad -> Venue).
   Kept deliberately simple - just a text input and a continue button -
   since the actual character work happens on the Squad screen next.
   ========================================================================= */

function TeamNameScreen({ teamName, onChangeName, onContinue, onBack }) {
  const trimmed = teamName.trim();
  return (
    <div className="pp-intro">
      <div className="pp-intro-card">
        <h1 className="pp-pixel pp-intro-title">CREATE A TEAM</h1>
        <p className="pp-hint">First, what's your team called?</p>
        <input
          className="pp-topbar-team pp-team-name-input"
          value={teamName}
          maxLength={18}
          autoFocus
          onChange={(e) => onChangeName(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter' && trimmed) onContinue(); }}
          placeholder="TEAM NAME"
        />
        <div className="pp-intro-actions">
          <button className="pp-btn primary full" disabled={!trimmed} onClick={onContinue}>
            NEXT: PICK YOUR SQUAD →
          </button>
          <button className="pp-btn full" onClick={onBack}>BACK</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   CREATE A TEAM: STEP 3 - HOME FIELD
   Last step of the "Create a Team" flow. Each venue gets a small live
   preview (the same FieldMarkings used everywhere else) so the choice
   is visual, not just a name in a list.
   ========================================================================= */

function VenueScreen({ selectedVenueId, onSelectVenue, onContinue, onBack }) {
  return (
    <div className="pp-intro pp-intro-venue">
      <div className="pp-venue-content">
        <div className="pp-venue-header">
          <h1 className="pp-pixel pp-intro-title">CHOOSE YOUR HOME FIELD</h1>
          <p className="pp-hint">Where does your team play its home games?</p>
        </div>

        <div className="pp-venue-grid-scroll">
          <div className="pp-venue-grid">
            {VENUES.map((v) => (
              <button
                key={v.id}
                className={`pp-venue-card${selectedVenueId === v.id ? ' selected' : ''}`}
                onClick={() => onSelectVenue(v.id)}
              >
                <svg viewBox="0 0 300 440" className="pp-venue-thumb" shapeRendering="crispEdges">
                  <FieldMarkings W={300} H={440} venue={v.id} />
                </svg>
                <span className="pp-venue-name">{v.name}</span>
                <span className="pp-venue-blurb">{v.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pp-intro-actions pp-venue-actions">
          <button className="pp-btn primary full" onClick={onContinue}>LET'S PLAY →</button>
          <button className="pp-btn full" onClick={onBack}>BACK</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   APP
   ========================================================================= */

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState('intro');
  const [teamName, setTeamName] = useState('THE COMETS');
  const [assignments, setAssignments] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [positionData, setPositionData] = useState({});
  const [questionBank, setQuestionBank] = useState(DEFAULT_QUESTION_BANK);
  const [venue, setVenue] = useState(DEFAULT_VENUE_ID);
  const [record, setRecord] = useState({ wins: 0, losses: 0, draws: 0 });
  const [unlockedIds, setUnlockedIds] = useState([]);
  // Set right when a win triggers a fresh unlock, so MatchScreen's full-time
  // panel can show "NEW PLAYER UNLOCKED!" for that one player. Cleared again
  // on the next match restart so it doesn't linger into a future win.
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);

  useEffect(() => {
    (async () => {
      const squad = await loadJSON('squad', null);
      if (squad) {
        if (squad.teamName) setTeamName(squad.teamName);
        if (squad.assignments) setAssignments(squad.assignments);
        if (squad.venue) setVenue(squad.venue);
      }
      const positions = await loadJSON('coach-positions', DEFAULT_POSITION_DATA);
      setPositionData(positions);
      const bank = await loadJSON('question-bank', DEFAULT_QUESTION_BANK);
      setQuestionBank(bank);
      const savedRecord = await loadJSON('team-record', { wins: 0, losses: 0, draws: 0 });
      setRecord(savedRecord);
      const savedUnlocks = await loadJSON('unlocked-players', []);
      setUnlockedIds(savedUnlocks);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (!loaded) return; saveJSON('squad', { teamName, assignments, venue }); }, [loaded, teamName, assignments, venue]);
  useEffect(() => { if (!loaded) return; saveJSON('coach-positions', positionData); }, [loaded, positionData]);
  useEffect(() => { if (!loaded) return; saveJSON('question-bank', questionBank); }, [loaded, questionBank]);
  useEffect(() => { if (!loaded) return; saveJSON('team-record', record); }, [loaded, record]);
  useEffect(() => { if (!loaded) return; saveJSON('unlocked-players', unlockedIds); }, [loaded, unlockedIds]);

  function handleCardClick(id) { setSelectedId((prev) => (prev === id ? null : id)); }
  function handleSlotClick(slotId) {
    setAssignments((prev) => {
      const next = { ...prev };
      if (selectedId) { next[slotId] = selectedId; } else { delete next[slotId]; }
      return next;
    });
    setSelectedId(null);
  }
  function handleAutoFill() {
    setAssignments((prev) => {
      const next = { ...prev };
      const used = new Set(Object.values(next));
      const pool = ROSTER.filter((c) => !used.has(c.id)).map((c) => c.id);
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      FORMATION_2_3_1.forEach((slot) => { if (!next[slot.id] && pool.length) next[slot.id] = pool.pop(); });
      return next;
    });
    setSelectedId(null);
  }
  function handleClear() { setAssignments({}); setSelectedId(null); }

  // "Create a Team" always starts from a clean slate - empty name prompt,
  // empty squad - rather than pre-filling whatever was last saved, since
  // the whole point of this flow is building a new team from scratch.
  // (Quick Start and "Play As {team}" are the paths for reusing an
  // existing team, so this doesn't touch those.)
  function handleStartCreateTeam() {
    setTeamName('');
    setAssignments({});
    setSelectedId(null);
    setScreen('create_name');
  }

  // Quick Start (intro screen) - builds a fresh random full squad regardless
  // of whatever's currently assigned, then drops straight into Match Day.
  // Distinct from handleAutoFill, which only fills gaps and is meant for
  // the Squad screen where the player may have already hand-picked some
  // positions they don't want disturbed.
  function handleQuickStart() {
    const pool = ROSTER.map((c) => c.id);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const next = {};
    FORMATION_2_3_1.forEach((slot) => { next[slot.id] = pool.pop(); });
    setAssignments(next);
    setSelectedId(null);
    setVenue(VENUES[Math.floor(Math.random() * VENUES.length)].id);
    setScreen('match');
  }
  function handleUpdatePosition(situationId, slotId, pct) {
    setPositionData((prev) => ({ ...prev, [situationId]: { ...(prev[situationId] || {}), [slotId]: pct } }));
  }
  function handleResetSituation(situationId) {
    setPositionData((prev) => { const next = { ...prev }; delete next[situationId]; return next; });
  }
  function handleSaveQuestion(updated) {
    setQuestionBank((prev) => {
      const exists = prev.some((q) => q.id === updated.id);
      return exists ? prev.map((q) => (q.id === updated.id ? updated : q)) : [...prev, updated];
    });
  }
  function handleDeleteQuestion(id) { setQuestionBank((prev) => prev.filter((q) => q.id !== id)); }
  function handleImportCoachData(importedPositionData, importedQuestionBank) {
    setPositionData(importedPositionData || {});
    setQuestionBank(importedQuestionBank?.length ? importedQuestionBank : DEFAULT_QUESTION_BANK);
  }

  // Tracks the team's all-time win/loss/draw record across every completed
  // match (any full 90 minutes played to the end), persisted independently
  // of squad/venue so starting a new "Create a Team" doesn't reset it.
  function handleMatchComplete(result) {
    setRecord((prev) => ({
      wins: prev.wins + (result === 'win' ? 1 : 0),
      losses: prev.losses + (result === 'loss' ? 1 : 0),
      draws: prev.draws + (result === 'draw' ? 1 : 0),
    }));

    if (result === 'win') {
      // Reveal the next not-yet-unlocked player in a fixed order, so
      // progress always feels like steady forward motion rather than a
      // re-roll that might "waste" a win on a repeat. Once all 8 are
      // unlocked, wins just stay wins - no banner, nothing left to reveal.
      setUnlockedIds((prev) => {
        const next = UNLOCKABLE_ROSTER.find((p) => !prev.includes(p.id));
        if (!next) {
          setNewlyUnlocked(null);
          return prev;
        }
        setNewlyUnlocked(next.id);
        return [...prev, next.id];
      });
    } else {
      setNewlyUnlocked(null);
    }
  }

  if (!loaded) {
    return (
      <div className="pp-app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <GlobalStyles />
        <p className="pp-pixel" style={{ color: 'var(--accent)' }}>LOADING...</p>
      </div>
    );
  }

  const hasFullSquad = Object.keys(assignments).length === 7;

  if (screen === 'intro') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <IntroScreen
          teamName={teamName}
          hasFullSquad={hasFullSquad}
          record={record}
          onPickTeam={handleStartCreateTeam}
          onPlayMatch={() => setScreen('match')}
          onQuickStart={handleQuickStart}
          onPlayExtreme={() => setScreen('extreme')}
        />
      </div>
    );
  }

  if (screen === 'create_name') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <TeamNameScreen
          teamName={teamName}
          onChangeName={setTeamName}
          onContinue={() => setScreen('create_squad')}
          onBack={() => setScreen('intro')}
        />
      </div>
    );
  }

  if (screen === 'create_venue') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <VenueScreen
          selectedVenueId={venue}
          onSelectVenue={setVenue}
          onContinue={() => setScreen('match')}
          onBack={() => setScreen('create_squad')}
        />
      </div>
    );
  }

  return (
    <div className="pp-app">
      <GlobalStyles />

      {/* Fixed top bar */}
      <header className="pp-topbar">
        <button className="pp-topbar-logo" onClick={() => setScreen('intro')} title="Back to title screen">
          <PixelBall size={26} />
        </button>
        <span className="pp-topbar-title">PIXEL PITCH FC</span>
        <input
          className="pp-topbar-team"
          value={teamName}
          maxLength={18}
          onChange={(e) => setTeamName(e.target.value.toUpperCase())}
        />
        <nav className="pp-topbar-nav">
          <button className={`pp-nav-btn${screen === 'squad' || screen === 'create_squad' ? ' active' : ''}`} onClick={() => setScreen('squad')}>SQUAD</button>
          <button className={`pp-nav-btn${screen === 'match' ? ' active' : ''}`} onClick={() => setScreen('match')}>MATCH</button>
          <button
            className={`pp-nav-btn pp-nav-btn-extreme${screen === 'extreme' ? ' active' : ''}`}
            onClick={() => setScreen('extreme')}
            disabled={!hasFullSquad}
            title={hasFullSquad ? 'Extreme Mode' : 'Pick a full squad first'}
          >
            ⚠ EXTREME
          </button>
        </nav>
        {/* Coach mode is intentionally left off the main nav - this small
            link is the only way in, so it stays out from underfoot for
            players who are just picking teams and playing matches. */}
        <button
          className={`pp-coach-link${screen === 'coach' ? ' active' : ''}`}
          onClick={() => setScreen('coach')}
          title="Coach mode"
          aria-label="Coach mode"
        >
          ⚙
        </button>
      </header>

      {(screen === 'squad' || screen === 'create_squad') && (
        <SquadScreen
          assignments={assignments}
          selectedId={selectedId}
          onCardClick={handleCardClick}
          onSlotClick={handleSlotClick}
          onAutoFill={handleAutoFill}
          onClear={handleClear}
          venue={venue}
          onContinueToVenue={screen === 'create_squad' ? () => setScreen('create_venue') : null}
          unlockedIds={unlockedIds}
        />
      )}

      {screen === 'coach' && (
        <CoachScreen
          positionData={positionData}
          onUpdatePosition={handleUpdatePosition}
          onResetSituation={handleResetSituation}
          questionBank={questionBank}
          onSaveQuestion={handleSaveQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onImportCoachData={handleImportCoachData}
          venue={venue}
        />
      )}

      {screen === 'match' && (
        <MatchScreen assignments={assignments} positionData={positionData} questionBank={questionBank} venue={venue} onMatchComplete={handleMatchComplete} record={record} newlyUnlocked={newlyUnlocked} onDismissUnlock={() => setNewlyUnlocked(null)} />
      )}

      {screen === 'extreme' && (
        <ExtremeModeScreen assignments={assignments} positionData={positionData} venue={venue} onExit={() => setScreen('match')} />
      )}
    </div>
  );
}
