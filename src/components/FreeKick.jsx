import { getBallRects } from '../utils/sprites.jsx';

/* =========================================================================
   FREE KICK MINI-GAME
   3-zone pick (Left/Center/Right). The keeper picks independently and
   randomly; a different zone than the keeper = goal.
   ========================================================================= */

export const FK_ZONES = ['L', 'C', 'R'];
const KEEPER_COLORS = { H: '#1f1b24', S: '#d9a066', J: '#ffd166', C: '#1d3557', P: '#1d3557' };

// Stylized keeper: upright with arms spread for a center guess, or tipped
// toward the dive direction (pivoting near the hips) with the near-side arm
// extended and a white glove at the tip for a left/right save attempt.
export function DivingKeeper({ direction, cx }) {
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

export default function FreeKick({ pick, keeperPick, onPick }) {
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
