import { Shuffle, RotateCcw } from 'lucide-react';
import { FORMATION_2_3_1, ROSTER, UNLOCKABLE_ROSTER, findPlayer } from '../data/gameData.js';
import { getSpriteRects, kitColors, PixelSprite, PixelHead } from '../utils/sprites.jsx';
import FieldMarkings from '../components/FieldMarkings.jsx';

/* =========================================================================
   SQUAD SCREEN
   ========================================================================= */

export default function SquadScreen({ assignments, selectedId, onCardClick, onSlotClick, onAutoFill, onClear, venue, onContinueToVenue, unlockedIds }) {
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
