import { DEFAULT_VENUE_ID } from '../data/gameData.js';

/* =========================================================================
   FIELD MARKINGS (shared by Squad field and Coach field)
   ========================================================================= */

const RAINBOW_STRIPES = ['#e63946', '#f3722c', '#ffd166', '#43aa8b', '#277da1', '#5e60ce', '#9b5de5'];

// All pitch-line markings (boundary, center circle, goal boxes, build-out
// lines), parameterized by stroke so they can be rendered twice for the
// rainbow field: a black halo underneath, then a white core on top. That
// double pass is what keeps the lines readable no matter which rainbow
// stripe colors happen to sit behind them - a single line color can
// contrast with a green field, but no single color contrasts with all
// seven rainbow hues at once.
function Markings({ W, H, color, opacity, lineW, goalBarH, buildOutColor }) {
  return (
    <>
      <rect x="10" y="10" width={W - 20} height={H - 20} fill="none" stroke={color} strokeWidth={lineW} opacity={opacity} />
      <line x1="10" y1={H / 2} x2={W - 10} y2={H / 2} stroke={color} strokeWidth={lineW} opacity={opacity} />
      <circle cx={W / 2} cy={H / 2} r="40" fill="none" stroke={color} strokeWidth={lineW} opacity={opacity} />
      <circle cx={W / 2} cy={H / 2} r="2.5" fill={color} opacity={opacity} />
      <line x1="10" y1="147.5" x2={W - 10} y2="147.5" stroke={buildOutColor} strokeWidth={lineW} strokeDasharray="6 4" opacity={opacity * 0.85} />
      <line x1="10" y1="292.5" x2={W - 10} y2="292.5" stroke={buildOutColor} strokeWidth={lineW} strokeDasharray="6 4" opacity={opacity * 0.85} />
      {/* opponent's goal (top) */}
      <rect x="70" y="10" width="160" height="65" fill="none" stroke={color} strokeWidth={lineW} opacity={opacity} />
      <rect x="115" y="10" width="70" height="28" fill="none" stroke={color} strokeWidth={lineW} opacity={opacity} />
      <path d="M 120 75 A 30 30 0 0 0 180 75" fill="none" stroke={color} strokeWidth={lineW} opacity={opacity} />
      <rect x="130" y="4" width="40" height={goalBarH} fill={color} opacity={opacity} />
      {/* own goal (bottom) */}
      <rect x="70" y={H - 75} width="160" height="65" fill="none" stroke={color} strokeWidth={lineW} opacity={opacity} />
      <rect x="115" y={H - 38} width="70" height="28" fill="none" stroke={color} strokeWidth={lineW} opacity={opacity} />
      <path d={`M 120 ${H - 75} A 30 30 0 0 1 180 ${H - 75}`} fill="none" stroke={color} strokeWidth={lineW} opacity={opacity} />
      <rect x="130" y={H - 10} width="40" height={goalBarH} fill={color} opacity={opacity} />
    </>
  );
}

export default function FieldMarkings({ W, H, venue = DEFAULT_VENUE_ID }) {
  const stripes = 8;
  const stripeH = H / stripes;
  const isRainbow = venue === 'rainbow_field';

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
    rainbow_field: { line: '#ffffff', lineOpacity: 1 },
  };
  const pal = PALETTES[venue] || PALETTES[DEFAULT_VENUE_ID];
  const isBlacktop = venue === 'elementary_school';

  return (
    <>
      {isRainbow ? (
        Array.from({ length: stripes }).map((_, i) => (
          <rect key={i} x="0" y={i * stripeH} width={W} height={stripeH} fill={RAINBOW_STRIPES[i % RAINBOW_STRIPES.length]} />
        ))
      ) : (
        <>
          <rect x="0" y="0" width={W} height={H} fill={pal.g2} />
          {!isBlacktop && Array.from({ length: stripes }).map((_, i) => (
            i % 2 === 0 && <rect key={i} x="0" y={i * stripeH} width={W} height={stripeH} fill={pal.g1} />
          ))}
        </>
      )}

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
          {/* Side stands - two packed columns of fans running the length of
              each touchline, between the top and bottom stands, so the
              crowd reads as hundreds strong rather than a thin accent. */}
          {Array.from({ length: 60 }).map((_, i) => {
            const rowH = (H - 28) / 60;
            const y = 14 + i * rowH;
            const color1 = i % 4 === 0 ? '#ffd166' : i % 2 === 0 ? '#e63946' : '#f1faee';
            const color2 = i % 4 === 1 ? '#e63946' : i % 2 === 0 ? '#ffd166' : '#f1faee';
            return (
              <g key={`side-${i}`}>
                <rect x="0" y={y} width="4" height={rowH - 0.4} fill={color1} />
                <rect x="4.6" y={y} width="4" height={rowH - 0.4} fill={color2} />
                <rect x={W - 4.6 - 4} y={y} width="4" height={rowH - 0.4} fill={color2} />
                <rect x={W - 4} y={y} width="4" height={rowH - 0.4} fill={color1} />
              </g>
            );
          })}
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

      {isRainbow && (
        <Markings W={W} H={H} color="#000000" opacity={0.9} lineW={4} goalBarH={8} buildOutColor="#000000" />
      )}
      <Markings
        W={W} H={H}
        color={pal.line}
        opacity={pal.lineOpacity}
        lineW={2}
        goalBarH={6}
        buildOutColor={isRainbow ? '#ffffff' : 'var(--accent)'}
      />
    </>
  );
}
