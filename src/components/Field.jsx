import { FORMATION_2_3_1, findPlayer } from '../data/gameData.js';
import { getSpriteRects, kitColors } from '../utils/sprites.jsx';
import FieldMarkings from './FieldMarkings.jsx';

/* =========================================================================
   SQUAD FIELD (formation slots filled with player sprites)
   ========================================================================= */

export default function Field({ assignments, onSlotClick }) {
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
