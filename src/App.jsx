import { useState, useEffect } from 'react';
import {
  DEFAULT_POSITION_DATA, DEFAULT_QUESTION_BANK,
  FORMATION_2_3_1, ROSTER, UNLOCKABLE_ROSTER, VENUES, createBlankTeam,
} from './data/gameData.js';
import {
  clearCurrentProfileName, getCurrentProfileName, listProfiles,
  loadProfileData, saveProfileData, setCurrentProfileName,
} from './utils/storage.js';
import { buildTeamKit, PixelBall } from './utils/sprites.jsx';
import GlobalStyles from './components/GlobalStyles.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import IntroScreen from './screens/IntroScreen.jsx';
import TeamsScreen from './screens/TeamsScreen.jsx';
import TeamNameScreen from './screens/TeamNameScreen.jsx';
import KitScreen from './screens/KitScreen.jsx';
import VenueScreen from './screens/VenueScreen.jsx';
import SquadScreen from './screens/SquadScreen.jsx';
import CoachScreen from './screens/CoachScreen.jsx';
import MatchScreen from './screens/MatchScreen.jsx';
import ExtremeModeScreen from './screens/ExtremeModeScreen.jsx';

// Quick Start teams haven't played anything yet, so they only draw from
// venues nobody has to unlock first.
const UNLOCKED_VENUES = VENUES.filter((v) => !v.unlock);

/* =========================================================================
   APP
   ========================================================================= */

export default function App() {
  const [profileName, setProfileName] = useState(() => getCurrentProfileName());
  const [profiles, setProfiles] = useState(() => listProfiles());
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState('intro');
  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  // Ephemeral "Quick Start" team - random squad/venue/kit, played instantly
  // and never saved into the profile's team list, so it doesn't clutter
  // My Teams with throwaway one-off squads.
  const [quickStartTeam, setQuickStartTeam] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [positionData, setPositionData] = useState(DEFAULT_POSITION_DATA);
  const [questionBank, setQuestionBank] = useState(DEFAULT_QUESTION_BANK);
  // Set right when a win triggers a fresh unlock, so MatchScreen's full-time
  // panel can show "NEW PLAYER UNLOCKED!" for that one player. Cleared again
  // on the next match restart so it doesn't linger into a future win.
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);

  const activeTeam = activeTeamId ? teams.find((t) => t.id === activeTeamId) : quickStartTeam;
  const teamKit = buildTeamKit(activeTeam?.jerseyId, activeTeam?.shortsId);

  // Routes every roster/kit/venue/name edit through to whichever team is
  // currently "in focus" - a saved team (by id) during normal play/editing,
  // or the ephemeral Quick Start team. Both the team-creation wizard and
  // live squad editing share this same path.
  function updateActiveTeam(updater) {
    if (activeTeamId) {
      setTeams((prev) => prev.map((t) => (t.id === activeTeamId ? updater(t) : t)));
    } else if (quickStartTeam) {
      setQuickStartTeam((prev) => updater(prev));
    }
  }

  // Loads this profile's saved teams + coach data the moment a profile is
  // chosen, and resets to a clean slate when switching away from one.
  useEffect(() => {
    if (!profileName) {
      setLoaded(false);
      return;
    }
    const data = loadProfileData(profileName, null);
    setTeams(data?.teams || []);
    setPositionData(data?.positionData || DEFAULT_POSITION_DATA);
    setQuestionBank(data?.questionBank || DEFAULT_QUESTION_BANK);
    setActiveTeamId(null);
    setQuickStartTeam(null);
    setScreen('intro');
    setLoaded(true);
  }, [profileName]);

  useEffect(() => {
    if (!loaded || !profileName) return;
    saveProfileData(profileName, { teams, positionData, questionBank });
  }, [loaded, profileName, teams, positionData, questionBank]);

  function handleChooseProfile(name) {
    setCurrentProfileName(name);
    setProfiles(listProfiles());
    setProfileName(name);
  }
  function handleSwitchProfile() {
    clearCurrentProfileName();
    setProfileName(null);
  }

  function handleCardClick(id) { setSelectedId((prev) => (prev === id ? null : id)); }
  function handleSlotClick(slotId) {
    updateActiveTeam((team) => {
      const next = { ...team.assignments };
      if (selectedId) { next[slotId] = selectedId; } else { delete next[slotId]; }
      return { ...team, assignments: next };
    });
    setSelectedId(null);
  }
  function handleAutoFill() {
    updateActiveTeam((team) => {
      const next = { ...team.assignments };
      const used = new Set(Object.values(next));
      const pool = ROSTER.filter((c) => !used.has(c.id)).map((c) => c.id);
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      FORMATION_2_3_1.forEach((slot) => { if (!next[slot.id] && pool.length) next[slot.id] = pool.pop(); });
      return { ...team, assignments: next };
    });
    setSelectedId(null);
  }
  function handleClear() {
    updateActiveTeam((team) => ({ ...team, assignments: {} }));
    setSelectedId(null);
  }

  // Starts a brand new team: a blank team is added to the profile's team
  // list right away (so the rest of the wizard can just edit "the active
  // team" the same way live squad editing does) and walked through
  // Name -> Squad -> Kit -> Venue.
  function handleStartCreateTeam() {
    const team = createBlankTeam();
    setTeams((prev) => [...prev, team]);
    setActiveTeamId(team.id);
    setSelectedId(null);
    setScreen('create_name');
  }

  // Backing out before naming the team discards it rather than leaving a
  // nameless placeholder cluttering My Teams.
  function handleBackFromTeamName() {
    setTeams((prev) => prev.filter((t) => !(t.id === activeTeamId && !t.teamName.trim())));
    setActiveTeamId(null);
    setScreen('teams');
  }

  function handleEditTeam(teamId) {
    setActiveTeamId(teamId);
    setSelectedId(null);
    setScreen('squad');
  }
  function handlePlayTeam(teamId) { setActiveTeamId(teamId); setScreen('match'); }
  function handlePlayExtremeTeam(teamId) { setActiveTeamId(teamId); setScreen('extreme'); }
  function handleDeleteTeam(teamId) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this team? This cannot be undone.')) return;
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (activeTeamId === teamId) setActiveTeamId(null);
  }

  // Quick Start - builds a fresh random full squad and drops straight into
  // Match Day without ever touching the saved team list. Distinct from
  // handleAutoFill, which only fills gaps in whichever team is active.
  function handleQuickStart() {
    const pool = ROSTER.map((c) => c.id);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const next = {};
    FORMATION_2_3_1.forEach((slot) => { next[slot.id] = pool.pop(); });
    setQuickStartTeam({
      ...createBlankTeam(),
      id: 'quick-start',
      teamName: 'QUICK START',
      assignments: next,
      venue: UNLOCKED_VENUES[Math.floor(Math.random() * UNLOCKED_VENUES.length)].id,
    });
    setActiveTeamId(null);
    setScreen('match');
  }

  function handleUpdatePosition(situationId, slotId, pct) {
    setPositionData((prev) => ({ ...prev, [situationId]: { ...(prev[situationId] || {}), [slotId]: pct } }));
  }
  function handleResetSituation(situationId) {
    setPositionData((prev) => { const next = { ...prev }; delete next[situationId]; return next; });
  }
  function handleSaveQuestion(updated) {
    setQuestionBank((prev) => {
      const exists = prev.some((q) => q.id === updated.id);
      return exists ? prev.map((q) => (q.id === updated.id ? updated : q)) : [...prev, updated];
    });
  }
  function handleDeleteQuestion(id) { setQuestionBank((prev) => prev.filter((q) => q.id !== id)); }
  function handleImportCoachData(importedPositionData, importedQuestionBank) {
    setPositionData(importedPositionData || {});
    setQuestionBank(importedQuestionBank?.length ? importedQuestionBank : DEFAULT_QUESTION_BANK);
  }

  // Tracks the active team's all-time win/loss/draw record across every
  // completed match (any full 90 minutes played to the end), and reveals
  // the next unlockable player on a win - both kept per-team so each
  // team's progress is its own.
  function handleMatchComplete(result) {
    if (!activeTeam) return;
    let unlockId = null;
    if (result === 'win') {
      const next = UNLOCKABLE_ROSTER.find((p) => !activeTeam.unlockedIds.includes(p.id));
      unlockId = next ? next.id : null;
    }
    setNewlyUnlocked(unlockId);
    updateActiveTeam((team) => ({
      ...team,
      record: {
        wins: team.record.wins + (result === 'win' ? 1 : 0),
        losses: team.record.losses + (result === 'loss' ? 1 : 0),
        draws: team.record.draws + (result === 'draw' ? 1 : 0),
      },
      unlockedIds: unlockId ? [...team.unlockedIds, unlockId] : team.unlockedIds,
    }));
  }

  // Beating all 8 Extreme Mode situations marks the active team as having
  // done so, for good, even if a later run falls short.
  function handleBeatExtreme() {
    updateActiveTeam((team) => (team.beatExtreme ? team : { ...team, beatExtreme: true }));
  }

  if (!profileName) {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <ProfileScreen profiles={profiles} onChooseProfile={handleChooseProfile} />
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="pp-app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <GlobalStyles />
        <p className="pp-pixel" style={{ color: 'var(--accent)' }}>LOADING...</p>
      </div>
    );
  }

  const hasFullSquad = activeTeam ? Object.keys(activeTeam.assignments).length === 7 : false;

  if (screen === 'intro') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <IntroScreen
          profileName={profileName}
          onOpenTeams={() => setScreen('teams')}
          onQuickStart={handleQuickStart}
          onSwitchProfile={handleSwitchProfile}
        />
      </div>
    );
  }

  if (screen === 'teams') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <TeamsScreen
          profileName={profileName}
          teams={teams}
          onCreateTeam={handleStartCreateTeam}
          onPlayTeam={handlePlayTeam}
          onPlayExtreme={handlePlayExtremeTeam}
          onEditTeam={handleEditTeam}
          onDeleteTeam={handleDeleteTeam}
          onBack={() => setScreen('intro')}
        />
      </div>
    );
  }

  if (screen === 'create_name') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <TeamNameScreen
          teamName={activeTeam?.teamName ?? ''}
          onChangeName={(name) => updateActiveTeam((t) => ({ ...t, teamName: name }))}
          onContinue={() => setScreen('create_squad')}
          onBack={handleBackFromTeamName}
        />
      </div>
    );
  }

  if (screen === 'create_kit') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <KitScreen
          jerseyId={activeTeam?.jerseyId}
          shortsId={activeTeam?.shortsId}
          onSelectJersey={(id) => updateActiveTeam((t) => ({ ...t, jerseyId: id }))}
          onSelectShorts={(id) => updateActiveTeam((t) => ({ ...t, shortsId: id }))}
          onContinue={() => setScreen('create_venue')}
          onBack={() => setScreen('create_squad')}
        />
      </div>
    );
  }

  if (screen === 'create_venue') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <VenueScreen
          selectedVenueId={activeTeam?.venue}
          onSelectVenue={(id) => updateActiveTeam((t) => ({ ...t, venue: id }))}
          onContinue={() => setScreen('match')}
          onBack={() => setScreen('create_kit')}
          beatExtreme={activeTeam?.beatExtreme}
        />
      </div>
    );
  }

  if (screen === 'change_venue') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <VenueScreen
          selectedVenueId={activeTeam?.venue}
          onSelectVenue={(id) => updateActiveTeam((t) => ({ ...t, venue: id }))}
          onContinue={() => setScreen('squad')}
          onBack={() => setScreen('squad')}
          beatExtreme={activeTeam?.beatExtreme}
          continueLabel="DONE"
        />
      </div>
    );
  }

  return (
    <div className="pp-app">
      <GlobalStyles />

      {/* Fixed top bar */}
      <header className="pp-topbar">
        <button className="pp-topbar-logo" onClick={() => setScreen('intro')} title="Back to title screen">
          <PixelBall size={26} />
        </button>
        <span className="pp-topbar-title">PIXEL PITCH FC</span>
        <input
          className="pp-topbar-team"
          value={activeTeam?.teamName ?? ''}
          maxLength={18}
          onChange={(e) => updateActiveTeam((t) => ({ ...t, teamName: e.target.value.toUpperCase() }))}
        />
        <nav className="pp-topbar-nav">
          <button className={`pp-nav-btn${screen === 'squad' || screen === 'create_squad' ? ' active' : ''}`} onClick={() => setScreen('squad')}>SQUAD</button>
          <button className={`pp-nav-btn${screen === 'match' ? ' active' : ''}`} onClick={() => setScreen('match')}>MATCH</button>
          <button
            className={`pp-nav-btn pp-nav-btn-extreme${screen === 'extreme' ? ' active' : ''}`}
            onClick={() => setScreen('extreme')}
            disabled={!hasFullSquad}
            title={hasFullSquad ? 'Extreme Mode' : 'Pick a full squad first'}
          >
            ⚠ EXTREME
          </button>
        </nav>
        {/* Coach mode is intentionally left off the main nav - this small
            link is the only way in, so it stays out from underfoot for
            players who are just picking teams and playing matches. */}
        <button
          className={`pp-coach-link${screen === 'coach' ? ' active' : ''}`}
          onClick={() => setScreen('coach')}
          title="Coach mode"
          aria-label="Coach mode"
        >
          ⚙
        </button>
      </header>

      {(screen === 'squad' || screen === 'create_squad') && activeTeam && (
        <SquadScreen
          assignments={activeTeam.assignments}
          selectedId={selectedId}
          onCardClick={handleCardClick}
          onSlotClick={handleSlotClick}
          onAutoFill={handleAutoFill}
          onClear={handleClear}
          venue={activeTeam.venue}
          teamKit={teamKit}
          onContinueToKit={screen === 'create_squad' ? () => setScreen('create_kit') : null}
          onChangeVenue={screen === 'squad' ? () => setScreen('change_venue') : null}
          unlockedIds={activeTeam.unlockedIds}
        />
      )}

      {screen === 'coach' && (
        <CoachScreen
          positionData={positionData}
          onUpdatePosition={handleUpdatePosition}
          onResetSituation={handleResetSituation}
          questionBank={questionBank}
          onSaveQuestion={handleSaveQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onImportCoachData={handleImportCoachData}
          venue={activeTeam?.venue}
          teamKit={teamKit}
        />
      )}

      {screen === 'match' && activeTeam && (
        <MatchScreen
          assignments={activeTeam.assignments}
          positionData={positionData}
          questionBank={questionBank}
          venue={activeTeam.venue}
          teamKit={teamKit}
          onMatchComplete={handleMatchComplete}
          record={activeTeam.record}
          newlyUnlocked={newlyUnlocked}
          onDismissUnlock={() => setNewlyUnlocked(null)}
        />
      )}

      {screen === 'extreme' && activeTeam && (
        <ExtremeModeScreen
          assignments={activeTeam.assignments}
          positionData={positionData}
          venue={activeTeam.venue}
          teamKit={teamKit}
          onExit={() => setScreen('match')}
          onBeatExtreme={handleBeatExtreme}
          beatExtreme={activeTeam.beatExtreme}
        />
      )}
    </div>
  );
}
