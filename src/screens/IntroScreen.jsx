import { useEffect, useRef } from 'react';
import { startIntroTheme } from '../utils/audio.js';
import { kitColors, awayKitColors, PixelBall } from '../utils/sprites.jsx';
import DancingRow from '../components/DancingRow.jsx';

/* =========================================================================
   INTRO SCREEN
   Title screen with two entry paths (jump straight into a random match, or
   open the team manager) plus an original chiptune fanfare. The Coach tab
   is intentionally not offered here - it's reachable only via the small
   link tucked in the corner, once inside the app, so it stays out of the
   way for kids just picking teams and playing.
   ========================================================================= */

export default function IntroScreen({ profileName, onOpenTeams, onQuickStart, onSwitchProfile }) {
  const themeRef = useRef(null);

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
          <p className="pp-intro-welcome">Welcome back, {profileName}!</p>
          <p className="pp-hint">Learn positions and soccer terms, then take it to Match Day.</p>

          <div className="pp-intro-actions">
            <button className="pp-btn primary full" onClick={() => handleSelect(onQuickStart)}>
              ⚡ QUICK START (RANDOM TEAM)
            </button>
            <button className="pp-btn full" onClick={() => handleSelect(onOpenTeams)}>
              MY TEAMS
            </button>
          </div>

          <button
            className="pp-hint"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => handleSelect(onSwitchProfile)}
          >
            Not {profileName}? Switch Player
          </button>
        </div>

        <DancingRow count={4} kit={awayKitColors} reverseDelay />
      </div>
    </div>
  );
}
