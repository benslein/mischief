import { useState } from 'react';
import { ROSTER } from '../data/gameData.js';
import CelebratingPlayer from './CelebratingPlayer.jsx';

// A row of distinct, randomly-picked roster looks, all dancing in either
// the home (red) or away (blue) kit - used on the intro screen so both
// "teams" are out on the pitch while the title music plays. Each player's
// own hairstyle/expression stays intact; only the kit color changes.
// The random pick + per-player animation delay are computed once via
// useState's lazy initializer, so they don't reshuffle on every render.
export default function DancingRow({ count, kit, reverseDelay = false }) {
  const [players] = useState(() => {
    const pool = [...ROSTER];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  });
  return (
    <div className="pp-dance-row">
      {players.map((p, i) => (
        <CelebratingPlayer
          key={p.id}
          player={p}
          size={40}
          delay={reverseDelay ? (count - i) * 0.07 : i * 0.07}
          kit={kit}
        />
      ))}
    </div>
  );
}
