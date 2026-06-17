import { PixelHead } from '../utils/sprites.jsx';

/* =========================================================================
   ROSTER CARD
   ========================================================================= */

export default function RosterCard({ player, selected, onClick }) {
  return (
    <div className={`pp-card${selected ? ' selected' : ''}`} onClick={onClick} role="button" tabIndex={0}>
      {selected && <span className="pp-card-badge pp-pixel">PLACING</span>}
      <PixelHead shape={player.shape} colors={player.colors} eyeRow={player.eyeRow} mouthRow={player.mouthRow} size={100} />
      <div className="pp-card-name">{player.name}</div>
      <div className="pp-card-tag">{player.tag}</div>
    </div>
  );
}
