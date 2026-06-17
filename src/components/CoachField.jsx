import { FORMATION_2_3_1, ROLE_COLOR } from '../data/gameData.js';
import { getBallRects } from '../utils/sprites.jsx';
import { fieldClickToPercent } from '../utils/fieldLogic.jsx';
import FieldMarkings from './FieldMarkings.jsx';

/* =========================================================================
   COACH FIELD
   Shows faint dashed markers for the base 2-3-1 formation (reference), plus
   solid colored markers for the current situation's positions. Tapping
   anywhere on the field places the currently-selected position there.
   ========================================================================= */

export default function CoachField({ positions, selectedSlot, onFieldClick }) {
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
