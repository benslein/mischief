import { useEffect, useRef } from 'react';
import { FORMATION_2_3_1, findPlayer } from '../data/gameData.js';
import { startChampionFanfare } from '../utils/audio.js';
import { kitColors } from '../utils/sprites.jsx';
import Fireworks from '../components/Fireworks.jsx';
import CelebratingPlayer from '../components/CelebratingPlayer.jsx';

/* =========================================================================
   CHAMPION SCREEN
   The big payoff for clearing all 8 Extreme Mode situations: huge title,
   the whole squad dancing on screen, fireworks, and a looping victory
   fanfare. Music starts the instant this mounts and stops the instant it
   unmounts (mode exited/restarted), same lifecycle pattern as the intro
   screen's theme song.
   ========================================================================= */

export default function ChampionScreen({ assignments, teamKit, onPlayAgain, onExit }) {
  const themeRef = useRef(null);

  useEffect(() => {
    themeRef.current = startChampionFanfare();
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

  const dancers = FORMATION_2_3_1.map((slot) => findPlayer(assignments[slot.id])).filter(Boolean);

  return (
    <div className="pp-champion">
      <Fireworks count={7} />
      <h1 className="pp-pixel pp-champion-title">SOCCER<br />STRATEGY<br />MASTER</h1>
      <p className="pp-champion-sub">All 8 situations. Every position. Zero excuses.</p>
      <div className="pp-celebration pp-champion-squad">
        {dancers.map((player, i) => (
          <CelebratingPlayer key={player.id} player={player} size={56} delay={i * 0.07} kit={(colors) => kitColors(colors, teamKit)} />
        ))}
      </div>
      <div className="pp-intro-actions pp-champion-actions">
        <button className="pp-btn primary full" onClick={() => handleSelect(onPlayAgain)}>PLAY AGAIN</button>
        <button className="pp-btn full" onClick={() => handleSelect(onExit)}>BACK TO MATCH</button>
      </div>
    </div>
  );
}
