/* =========================================================================
   CREATE A TEAM: STEP 1 - TEAM NAME
   First step of the "Create a Team" flow (Intro -> Name -> Squad -> Venue).
   Kept deliberately simple - just a text input and a continue button -
   since the actual character work happens on the Squad screen next.
   ========================================================================= */

export default function TeamNameScreen({ teamName, onChangeName, onContinue, onBack }) {
  const trimmed = teamName.trim();
  return (
    <div className="pp-intro">
      <div className="pp-intro-card">
        <h1 className="pp-pixel pp-intro-title">CREATE A TEAM</h1>
        <p className="pp-hint">First, what's your team called?</p>
        <input
          className="pp-topbar-team pp-team-name-input"
          value={teamName}
          maxLength={18}
          autoFocus
          onChange={(e) => onChangeName(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter' && trimmed) onContinue(); }}
          placeholder="TEAM NAME"
        />
        <div className="pp-intro-actions">
          <button className="pp-btn primary full" disabled={!trimmed} onClick={onContinue}>
            NEXT: PICK YOUR SQUAD →
          </button>
          <button className="pp-btn full" onClick={onBack}>BACK</button>
        </div>
      </div>
    </div>
  );
}
