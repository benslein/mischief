import { getSpriteRects, kitColors } from '../utils/sprites.jsx';

// A player sprite with small arm overlays that bob up and down, for the
// post-win celebration.
export default function CelebratingPlayer({ player, size = 44, delay = 0, kit = kitColors }) {
  const colors = kit(player.colors);
  return (
    <svg viewBox="0 0 12 16" width={size} height={(size * 16) / 12} shapeRendering="crispEdges">
      {getSpriteRects(player.shape, colors, player.eyeRow, player.mouthRow)}
      <rect className="pp-dance-arm" x="0.5" y="11" width="1.5" height="3" fill={colors.S} style={{ animationDelay: `${delay}s` }} />
      <rect className="pp-dance-arm" x="10" y="11" width="1.5" height="3" fill={colors.S} style={{ animationDelay: `${delay}s` }} />
    </svg>
  );
}
