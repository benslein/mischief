import { VENUES } from '../data/gameData.js';
import FieldMarkings from '../components/FieldMarkings.jsx';

/* =========================================================================
   CREATE A TEAM: STEP 3 - HOME FIELD
   Last step of the "Create a Team" flow. Each venue gets a small live
   preview (the same FieldMarkings used everywhere else) so the choice
   is visual, not just a name in a list.
   ========================================================================= */

export default function VenueScreen({ selectedVenueId, onSelectVenue, onContinue, onBack }) {
  return (
    <div className="pp-intro pp-intro-venue">
      <div className="pp-venue-content">
        <div className="pp-venue-header">
          <h1 className="pp-pixel pp-intro-title">CHOOSE YOUR HOME FIELD</h1>
          <p className="pp-hint">Where does your team play its home games?</p>
        </div>

        <div className="pp-venue-grid-scroll">
          <div className="pp-venue-grid">
            {VENUES.map((v) => (
              <button
                key={v.id}
                className={`pp-venue-card${selectedVenueId === v.id ? ' selected' : ''}`}
                onClick={() => onSelectVenue(v.id)}
              >
                <svg viewBox="0 0 300 440" className="pp-venue-thumb" shapeRendering="crispEdges">
                  <FieldMarkings W={300} H={440} venue={v.id} />
                </svg>
                <span className="pp-venue-name">{v.name}</span>
                <span className="pp-venue-blurb">{v.blurb}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pp-intro-actions pp-venue-actions">
          <button className="pp-btn primary full" onClick={onContinue}>LET'S PLAY →</button>
          <button className="pp-btn full" onClick={onBack}>BACK</button>
        </div>
      </div>
    </div>
  );
}
