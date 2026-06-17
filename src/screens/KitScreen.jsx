import { JERSEY_OPTIONS, SHORTS_OPTIONS, ROSTER } from '../data/gameData.js';
import { buildTeamKit, kitColors, PixelSprite } from '../utils/sprites.jsx';

/* =========================================================================
   CREATE A TEAM: STEP 3 - KIT SELECT
   Sits between Squad and Venue in the "Create a Team" flow. Jersey and
   shorts colors are chosen independently; trim is derived (not chosen) so
   every combination still reads as a real uniform. The picked kit is
   applied everywhere the player's own team renders for the rest of the game.
   ========================================================================= */

export default function KitScreen({ jerseyId, shortsId, onSelectJersey, onSelectShorts, onContinue, onBack }) {
  const previewPlayer = ROSTER[0];
  const previewKit = buildTeamKit(jerseyId, shortsId);

  return (
    <div className="pp-intro">
      <div className="pp-intro-card">
        <h1 className="pp-pixel pp-intro-title">CHOOSE YOUR KIT</h1>
        <p className="pp-hint">Pick your team's jersey and shorts colors.</p>

        <PixelSprite
          shape={previewPlayer.shape}
          colors={kitColors(previewPlayer.colors, previewKit)}
          eyeRow={previewPlayer.eyeRow}
          mouthRow={previewPlayer.mouthRow}
          size={96}
        />

        <span className="pp-label">JERSEY</span>
        <div className="pp-chip-row" style={{ justifyContent: 'center' }}>
          {JERSEY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`pp-chip${jerseyId === opt.id ? ' active' : ''}`}
              onClick={() => onSelectJersey(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="pp-label">SHORTS</span>
        <div className="pp-chip-row" style={{ justifyContent: 'center' }}>
          {SHORTS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`pp-chip${shortsId === opt.id ? ' active' : ''}`}
              onClick={() => onSelectShorts(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="pp-intro-actions">
          <button className="pp-btn primary full" onClick={onContinue}>
            NEXT: CHOOSE HOME FIELD →
          </button>
          <button className="pp-btn full" onClick={onBack}>BACK</button>
        </div>
      </div>
    </div>
  );
}
