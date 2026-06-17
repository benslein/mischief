import { useEffect, useRef } from 'react';
import { startIntroTheme } from '../utils/audio.js';
import { kitColors, awayKitColors, PixelBall } from '../utils/sprites.jsx';
import DancingRow from '../components/DancingRow.jsx';

/* =========================================================================
   INTRO SCREEN
   Title screen with two entry paths (pick a new squad, or jump straight
   into a match with whatever squad is already saved) plus an original
   chiptune fanfare. The Coach tab is intentionally not offered here - it's
   reachable only via the small link tucked in the corner, once inside the
   app, so it stays out of the way for kids just picking teams and playing.
   ========================================================================= */

export default function IntroScreen({ teamName, hasFullSquad, record, onPickTeam, onPlayMatch, onQuickStart, onPlayExtreme }) {
  const themeRef = useRef(null);
  const gamesPlayed = record.wins + record.losses + record.draws;

  useEffect(() => {
    themeRef.current = startIntroTheme();
    return () => {
      if (themeRef.current) themeRef.current.stop();
    };
  }, []);

  function handleSelect(action) {
    if (themeRef.current) {
      themeRef.current.stop();
      themeRef.current = null;
    }
    action();
  }

  return (
    <div className="pp-intro">
      <div className="pp-intro-content">
        <DancingRow count={4} kit={kitColors} />

        <div className="pp-intro-card">
          <div className="pp-intro-balls">
            <PixelBall size={40} />
            <PixelBall size={40} />
          </div>
          <h1 className="pp-pixel pp-intro-title">PIXEL PITCH FC</h1>
          <p className="pp-intro-welcome">Welcome to Pixel Pitch FC!</p>
          <p className="pp-hint">Learn positions and soccer terms, then take it to Match Day.</p>
          {gamesPlayed > 0 && (
            <p className="pp-intro-record">
              ALL-TIME RECORD: <span className="pp-record-w">{record.wins}W</span>
              {' '}<span className="pp-record-l">{record.losses}L</span>
              {' '}<span className="pp-record-d">{record.draws}D</span>
            </p>
          )}

          <div className="pp-intro-actions">
            <button className="pp-btn primary full" onClick={() => handleSelect(onQuickStart)}>
              ⚡ QUICK START (RANDOM TEAM)
            </button>
            <button className="pp-btn full" onClick={() => handleSelect(onPickTeam)}>
              CREATE A TEAM
            </button>
            <button
              className="pp-btn full"
              disabled={!hasFullSquad}
              onClick={() => handleSelect(onPlayMatch)}
              title={hasFullSquad ? `Play as ${teamName}` : 'Pick a full squad first'}
            >
              {hasFullSquad ? `PLAY AS ${teamName}` : 'PLAY MATCH (PICK A SQUAD FIRST)'}
            </button>
            {hasFullSquad && (
              <button className="pp-btn full pp-btn-extreme" onClick={() => handleSelect(onPlayExtreme)}>
                ⚠ EXTREME MODE
              </button>
            )}
          </div>
        </div>

        <DancingRow count={4} kit={awayKitColors} reverseDelay />
      </div>
    </div>
  );
}
