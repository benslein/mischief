import { fieldClickToPercent, renderContextMarker } from '../utils/fieldLogic.jsx';
import FieldMarkings from './FieldMarkings.jsx';

/* =========================================================================
   ANSWER FIELD (Match Day)
   Tap-to-answer field. Shows scenario context markers; once locked, reveals
   the correct target/zone (only if the answer was wrong) and the player's
   tap (green if correct, red if not).
   ========================================================================= */

export default function AnswerField({ context, tap, correct, target, zones, locked, onTap }) {
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
