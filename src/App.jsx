import { useState, useEffect } from 'react';
import {
  DEFAULT_POSITION_DATA, DEFAULT_QUESTION_BANK, DEFAULT_VENUE_ID,
  FORMATION_2_3_1, ROSTER, UNLOCKABLE_ROSTER, VENUES,
} from './data/gameData.js';
import { loadJSON, saveJSON } from './utils/storage.js';
import { PixelBall } from './utils/sprites.jsx';
import GlobalStyles from './components/GlobalStyles.jsx';
import IntroScreen from './screens/IntroScreen.jsx';
import TeamNameScreen from './screens/TeamNameScreen.jsx';
import VenueScreen from './screens/VenueScreen.jsx';
import SquadScreen from './screens/SquadScreen.jsx';
import CoachScreen from './screens/CoachScreen.jsx';
import MatchScreen from './screens/MatchScreen.jsx';
import ExtremeModeScreen from './screens/ExtremeModeScreen.jsx';

/* =========================================================================
   APP
   ========================================================================= */

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState('intro');
  const [teamName, setTeamName] = useState('THE COMETS');
  const [assignments, setAssignments] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [positionData, setPositionData] = useState({});
  const [questionBank, setQuestionBank] = useState(DEFAULT_QUESTION_BANK);
  const [venue, setVenue] = useState(DEFAULT_VENUE_ID);
  const [record, setRecord] = useState({ wins: 0, losses: 0, draws: 0 });
  const [unlockedIds, setUnlockedIds] = useState([]);
  // Set right when a win triggers a fresh unlock, so MatchScreen's full-time
  // panel can show "NEW PLAYER UNLOCKED!" for that one player. Cleared again
  // on the next match restart so it doesn't linger into a future win.
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);

  useEffect(() => {
    (async () => {
      const squad = await loadJSON('squad', null);
      if (squad) {
        if (squad.teamName) setTeamName(squad.teamName);
        if (squad.assignments) setAssignments(squad.assignments);
        if (squad.venue) setVenue(squad.venue);
      }
      const positions = await loadJSON('coach-positions', DEFAULT_POSITION_DATA);
      setPositionData(positions);
      const bank = await loadJSON('question-bank', DEFAULT_QUESTION_BANK);
      setQuestionBank(bank);
      const savedRecord = await loadJSON('team-record', { wins: 0, losses: 0, draws: 0 });
      setRecord(savedRecord);
      const savedUnlocks = await loadJSON('unlocked-players', []);
      setUnlockedIds(savedUnlocks);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (!loaded) return; saveJSON('squad', { teamName, assignments, venue }); }, [loaded, teamName, assignments, venue]);
  useEffect(() => { if (!loaded) return; saveJSON('coach-positions', positionData); }, [loaded, positionData]);
  useEffect(() => { if (!loaded) return; saveJSON('question-bank', questionBank); }, [loaded, questionBank]);
  useEffect(() => { if (!loaded) return; saveJSON('team-record', record); }, [loaded, record]);
  useEffect(() => { if (!loaded) return; saveJSON('unlocked-players', unlockedIds); }, [loaded, unlockedIds]);

  function handleCardClick(id) { setSelectedId((prev) => (prev === id ? null : id)); }
  function handleSlotClick(slotId) {
    setAssignments((prev) => {
      const next = { ...prev };
      if (selectedId) { next[slotId] = selectedId; } else { delete next[slotId]; }
      return next;
    });
    setSelectedId(null);
  }
  function handleAutoFill() {
    setAssignments((prev) => {
      const next = { ...prev };
      const used = new Set(Object.values(next));
      const pool = ROSTER.filter((c) => !used.has(c.id)).map((c) => c.id);
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      FORMATION_2_3_1.forEach((slot) => { if (!next[slot.id] && pool.length) next[slot.id] = pool.pop(); });
      return next;
    });
    setSelectedId(null);
  }
  function handleClear() { setAssignments({}); setSelectedId(null); }

  // "Create a Team" always starts from a clean slate - empty name prompt,
  // empty squad - rather than pre-filling whatever was last saved, since
  // the whole point of this flow is building a new team from scratch.
  // (Quick Start and "Play As {team}" are the paths for reusing an
  // existing team, so this doesn't touch those.)
  function handleStartCreateTeam() {
    setTeamName('');
    setAssignments({});
    setSelectedId(null);
    setScreen('create_name');
  }

  // Quick Start (intro screen) - builds a fresh random full squad regardless
  // of whatever's currently assigned, then drops straight into Match Day.
  // Distinct from handleAutoFill, which only fills gaps and is meant for
  // the Squad screen where the player may have already hand-picked some
  // positions they don't want disturbed.
  function handleQuickStart() {
    const pool = ROSTER.map((c) => c.id);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const next = {};
    FORMATION_2_3_1.forEach((slot) => { next[slot.id] = pool.pop(); });
    setAssignments(next);
    setSelectedId(null);
    setVenue(VENUES[Math.floor(Math.random() * VENUES.length)].id);
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

  // Tracks the team's all-time win/loss/draw record across every completed
  // match (any full 90 minutes played to the end), persisted independently
  // of squad/venue so starting a new "Create a Team" doesn't reset it.
  function handleMatchComplete(result) {
    setRecord((prev) => ({
      wins: prev.wins + (result === 'win' ? 1 : 0),
      losses: prev.losses + (result === 'loss' ? 1 : 0),
      draws: prev.draws + (result === 'draw' ? 1 : 0),
    }));

    if (result === 'win') {
      // Reveal the next not-yet-unlocked player in a fixed order, so
      // progress always feels like steady forward motion rather than a
      // re-roll that might "waste" a win on a repeat. Once all 8 are
      // unlocked, wins just stay wins - no banner, nothing left to reveal.
      setUnlockedIds((prev) => {
        const next = UNLOCKABLE_ROSTER.find((p) => !prev.includes(p.id));
        if (!next) {
          setNewlyUnlocked(null);
          return prev;
        }
        setNewlyUnlocked(next.id);
        return [...prev, next.id];
      });
    } else {
      setNewlyUnlocked(null);
    }
  }

  if (!loaded) {
    return (
      <div className="pp-app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <GlobalStyles />
        <p className="pp-pixel" style={{ color: 'var(--accent)' }}>LOADING...</p>
      </div>
    );
  }

  const hasFullSquad = Object.keys(assignments).length === 7;

  if (screen === 'intro') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <IntroScreen
          teamName={teamName}
          hasFullSquad={hasFullSquad}
          record={record}
          onPickTeam={handleStartCreateTeam}
          onPlayMatch={() => setScreen('match')}
          onQuickStart={handleQuickStart}
          onPlayExtreme={() => setScreen('extreme')}
        />
      </div>
    );
  }

  if (screen === 'create_name') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <TeamNameScreen
          teamName={teamName}
          onChangeName={setTeamName}
          onContinue={() => setScreen('create_squad')}
          onBack={() => setScreen('intro')}
        />
      </div>
    );
  }

  if (screen === 'create_venue') {
    return (
      <div className="pp-app">
        <GlobalStyles />
        <VenueScreen
          selectedVenueId={venue}
          onSelectVenue={setVenue}
          onContinue={() => setScreen('match')}
          onBack={() => setScreen('create_squad')}
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
          value={teamName}
          maxLength={18}
          onChange={(e) => setTeamName(e.target.value.toUpperCase())}
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

      {(screen === 'squad' || screen === 'create_squad') && (
        <SquadScreen
          assignments={assignments}
          selectedId={selectedId}
          onCardClick={handleCardClick}
          onSlotClick={handleSlotClick}
          onAutoFill={handleAutoFill}
          onClear={handleClear}
          venue={venue}
          onContinueToVenue={screen === 'create_squad' ? () => setScreen('create_venue') : null}
          unlockedIds={unlockedIds}
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
          venue={venue}
        />
      )}

      {screen === 'match' && (
        <MatchScreen assignments={assignments} positionData={positionData} questionBank={questionBank} venue={venue} onMatchComplete={handleMatchComplete} record={record} newlyUnlocked={newlyUnlocked} onDismissUnlock={() => setNewlyUnlocked(null)} />
      )}

      {screen === 'extreme' && (
        <ExtremeModeScreen assignments={assignments} positionData={positionData} venue={venue} onExit={() => setScreen('match')} />
      )}
    </div>
  );
}
