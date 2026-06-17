/* =========================================================================
   PIXEL SPRITE SYSTEM - SHAPE DATA
   - Each character shape is defined as a LEFT HALF (6 cols x 16 rows) and
     mirrored to a full 12x16 grid, so every sprite is symmetric by design.
   - Palette keys: . transparent | K outline | H hair | S skin | B eye
                   M mouth | J jersey | C jersey trim | P shorts | N accessory
   - K, B, M are fixed across all characters; H/S/J/C/P/N vary per character.
   ========================================================================= */

export const BASE_SHAPES = {
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
export const EYE_BIG = 'KSBBSS';
export const MOUTH_GRIN = 'KSSWWM';
export const MOUTH_SMALL = 'KSSSSM';
export const EYE_ANGRY = 'KKBBSS';
export const MOUTH_SCOWL = 'KSMMMM';

// Opposing team - rendered with the same sprite system, in a blue kit with
// an angry expression, instead of a plain colored dot.
export const OPPONENT_SHAPE = 'cap_visor';
export const OPPONENT_COLORS = { H: '#3a1f1f', S: '#c98a5e', N: '#1d3557', J: '#1d3557', C: '#457b9d', P: '#1d3557' };

export const FIXED = { K: '#262335', B: '#1a1a2e', M: '#3a1f1f', W: '#ffffff' };

/* =========================================================================
   KIT CUSTOMIZATION
   Two independent choices - jersey color and shorts color - made on the
   Kit Select screen (between Squad and Venue in the "Create a Team" flow)
   and applied to every render of the player's own team for the rest of
   the game. Trim color isn't chosen directly; it's derived from the
   jersey pick so any combination still reads as a coherent uniform.
   ========================================================================= */

export const JERSEY_OPTIONS = [
  { id: 'red', label: 'Red Top', color: '#e63946' },
  { id: 'white', label: 'White Top', color: '#ffffff' },
  { id: 'yellow', label: 'Yellow Top', color: '#ffd166' },
  { id: 'green', label: 'Green Top', color: '#06d6a0' },
  { id: 'purple', label: 'Purple Top', color: '#9d4edd' },
  { id: 'pink', label: 'Pink Top', color: '#ff70a6' },
  { id: 'black', label: 'Black Top', color: '#1a1a1a' },
];
export const SHORTS_OPTIONS = [
  { id: 'white', label: 'White Shorts', color: '#ffffff' },
  { id: 'red', label: 'Red Shorts', color: '#e63946' },
  { id: 'yellow', label: 'Yellow Shorts', color: '#ffd166' },
  { id: 'green', label: 'Green Shorts', color: '#06d6a0' },
  { id: 'purple', label: 'Purple Shorts', color: '#9d4edd' },
  { id: 'pink', label: 'Pink Shorts', color: '#ff70a6' },
  { id: 'black', label: 'Black Shorts', color: '#1a1a1a' },
];
export const DEFAULT_JERSEY_ID = JERSEY_OPTIONS[0].id;
export const DEFAULT_SHORTS_ID = SHORTS_OPTIONS[0].id;

/* =========================================================================
   ROSTER DATA
   12 characters to choose from. `id` must stay unique and stable -
   Coach Mode and the quiz engine will reference players by this id.
   ========================================================================= */

export const ROSTER = [
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
export const UNLOCKABLE_ROSTER = [
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
export function findPlayer(id) {
  return ROSTER.find((p) => p.id === id) || UNLOCKABLE_ROSTER.find((p) => p.id === id);
}

/* =========================================================================
   FORMATION DATA
   2-3-1 for 7v7 (GK + 2 DEF + 3 MID + 1 FWD). x/y are % of field width/height,
   field assumed to attack TOWARD y=0 (top) and defend y=100 (bottom).
   This is also the BASE/DEFAULT formation shown faintly in Coach Mode, and
   the fallback position for any situation that hasn't been customized yet.
   ========================================================================= */

export const FORMATION_2_3_1 = [
  { id: 'gk', label: 'GK', full: 'Goalkeeper', x: 50, y: 92 },
  { id: 'lb', label: 'LB', full: 'Left Back', x: 26, y: 70 },
  { id: 'rb', label: 'RB', full: 'Right Back', x: 74, y: 70 },
  { id: 'lm', label: 'LM', full: 'Left Mid', x: 16, y: 44 },
  { id: 'cm', label: 'CM', full: 'Center Mid', x: 50, y: 44 },
  { id: 'rm', label: 'RM', full: 'Right Mid', x: 84, y: 44 },
  { id: 'st', label: 'ST', full: 'Striker', x: 50, y: 13 },
];

export const BALL_SLOT = { id: 'ball', label: 'BALL', full: 'the ball', x: 50, y: 50 };
export const ALL_SLOTS = [BALL_SLOT, ...FORMATION_2_3_1];
export const SLOT_ORDER = ALL_SLOTS.map((s) => s.id);

export const ROLE_COLOR = {
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

export const SITUATIONS = [
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

export const TERMINOLOGY_QUESTIONS = [
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
export const DEFAULT_POSITION_DATA = {
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

export const DEFAULT_QUESTION_BANK = [
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

/* =========================================================================
   VENUES (home fields)
   Each venue swaps the field's color palette and adds a few small
   decorative touches, without changing the 300x440 layout, the pitch
   boundary, or any coordinate math - decorations are drawn either behind
   the grass (so they never sit on top of a player sprite) or tucked into
   the corners, away from where markers/positions are ever placed.
   ========================================================================= */

export const VENUES = [
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
  {
    id: 'rainbow_field',
    name: 'Rainbow Field',
    blurb: 'The Extreme Mode trophy field. Every color, all at once.',
    unlock: 'beatExtreme',
  },
];
export const DEFAULT_VENUE_ID = VENUES[0].id;

/* =========================================================================
   TEAMS
   A profile can save multiple teams, each with its own roster, kit, home
   field, win/loss/draw record, and whether it has ever beaten Extreme
   Mode. createBlankTeam() is the starting point both for "create a new
   team" and as the shape every saved team is expected to have.
   ========================================================================= */

export function createBlankTeam() {
  return {
    id: `team-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    teamName: '',
    assignments: {},
    venue: DEFAULT_VENUE_ID,
    jerseyId: DEFAULT_JERSEY_ID,
    shortsId: DEFAULT_SHORTS_ID,
    unlockedIds: [],
    record: { wins: 0, losses: 0, draws: 0 },
    beatExtreme: false,
  };
}
