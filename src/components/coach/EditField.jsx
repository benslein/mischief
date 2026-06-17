import { fieldClickToPercent, renderContextMarker } from '../../utils/fieldLogic.jsx';
import FieldMarkings from '../FieldMarkings.jsx';

/* =========================================================================
   COACH MODE - QUESTION BANK EDITOR
   Lets the coach edit wording, context markers, and answer zones for any
   field-tap "terminology" question, and add new ones. Position questions
   (where a player should stand) stay auto-generated from the Positions
   tab's set-play data - their wording is templated, not edited here.
   ========================================================================= */

export default function EditField({ context, zones, pendingCorner, onTap }) {
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
