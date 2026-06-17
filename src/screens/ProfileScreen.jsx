import { useState } from 'react';

/* =========================================================================
   WHO'S PLAYING
   Lightweight local "profile" picker - just a name, no password or
   account. Lets multiple kids share one device while keeping their own
   teams and progress separate in this browser's storage.
   ========================================================================= */

export default function ProfileScreen({ profiles, onChooseProfile, onDeleteProfile }) {
  const [name, setName] = useState('');
  const trimmed = name.trim();

  return (
    <div className="pp-intro">
      <div className="pp-intro-card">
        <h1 className="pp-pixel pp-intro-title">WHO'S PLAYING?</h1>
        <p className="pp-hint">Pick your name, or type a new one to start fresh.</p>

        {profiles.length > 0 && (
          <div className="pp-intro-actions">
            {profiles.map((p) => (
              <div key={p} className="pp-profile-row">
                <button className="pp-btn full" onClick={() => onChooseProfile(p)}>
                  {p}
                </button>
                <button
                  className="pp-btn pp-profile-delete"
                  onClick={() => onDeleteProfile(p)}
                  aria-label={`Delete ${p}`}
                  title={`Delete ${p}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          className="pp-topbar-team pp-team-name-input"
          value={name}
          maxLength={18}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter' && trimmed) onChooseProfile(trimmed); }}
          placeholder="NEW PLAYER NAME"
        />
        <div className="pp-intro-actions">
          <button className="pp-btn primary full" disabled={!trimmed} onClick={() => onChooseProfile(trimmed)}>
            START PLAYING →
          </button>
        </div>
      </div>
    </div>
  );
}
