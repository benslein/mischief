/* =========================================================================
   MY TEAMS
   Hub for everything team-related: pick a saved team to play a match or
   Extreme Mode, jump into editing its roster, delete it, or start a brand
   new team. Each team tracks its own win/loss/draw record and whether it
   has ever beaten Extreme Mode.
   ========================================================================= */

export default function TeamsScreen({ profileName, teams, onCreateTeam, onPlayTeam, onPlayExtreme, onEditTeam, onDeleteTeam, onBack }) {
  return (
    <div className="pp-intro pp-intro-venue">
      <div className="pp-venue-content">
        <div className="pp-venue-header">
          <h1 className="pp-pixel pp-intro-title">MY TEAMS</h1>
          <p className="pp-hint">{profileName}'s teams. Pick one to play, or create a new one.</p>
        </div>

        <div className="pp-venue-grid-scroll">
          <div className="pp-lineup-list">
            {teams.length === 0 && <p className="pp-hint">No teams yet — create your first one below.</p>}
            {teams.map((team) => {
              const filledCount = Object.keys(team.assignments).length;
              const hasFullSquad = filledCount === 7;
              return (
                <div key={team.id} className="pp-result-panel" style={{ alignItems: 'stretch', textAlign: 'left' }}>
                  <h2 style={{ color: 'var(--accent)' }}>{team.teamName || 'UNNAMED TEAM'}</h2>
                  <p>
                    <span className="pp-record-w">{team.record.wins}W</span>{' '}
                    <span className="pp-record-l">{team.record.losses}L</span>{' '}
                    <span className="pp-record-d">{team.record.draws}D</span>
                    {team.beatExtreme && <> &middot; 🏆 Beat Extreme Mode</>}
                  </p>
                  <div className="pp-action-bar">
                    <button className="pp-btn primary" disabled={!hasFullSquad} onClick={() => onPlayTeam(team.id)}>
                      {hasFullSquad ? 'PLAY MATCH' : `SQUAD ${filledCount}/7`}
                    </button>
                    {hasFullSquad && (
                      <button className="pp-btn pp-btn-extreme" onClick={() => onPlayExtreme(team.id)}>⚠ EXTREME</button>
                    )}
                    <button className="pp-btn" onClick={() => onEditTeam(team.id)}>EDIT SQUAD</button>
                    <button className="pp-btn" onClick={() => onDeleteTeam(team.id)}>DELETE</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pp-intro-actions pp-venue-actions">
          <button className="pp-btn primary full" onClick={onCreateTeam}>+ CREATE NEW TEAM</button>
          <button className="pp-btn full" onClick={onBack}>BACK</button>
        </div>
      </div>
    </div>
  );
}
