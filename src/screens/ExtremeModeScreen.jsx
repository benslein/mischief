import { useState } from 'react';
import { ALL_SLOTS, BALL_SLOT, SITUATIONS, findPlayer } from '../data/gameData.js';
import { fieldClickToPercent, renderContextMarker } from '../utils/fieldLogic.jsx';
import FieldMarkings from '../components/FieldMarkings.jsx';
import ChampionScreen from './ChampionScreen.jsx';

/* =========================================================================
   EXTREME MODE
   A harder, all-in-one drill: pick a random situation (e.g. "Corner Kick -
   Attack"), then place the ball AND every one of the 7 players, one at a
   time, with no on-field reference markers showing where anyone else
   should be (unlike Match Day's position questions, which always show
   everyone else lined up correctly as context). Ends with a single
   8-for-8 style result rather than feeding into the match score/streak/
   free-kick loop, since the whole point is a focused, harder rep.
   ========================================================================= */

export default function ExtremeModeScreen({ assignments, positionData, venue, teamKit, onExit }) {
  const W = 300, H = 440;
  const MAX_MISTAKES = 3;
  // Ball is auto-placed (shown correctly from the start of every
  // situation) - only the 7 outfield/GK slots are actually placed by the
  // player, and ALL 7 must be correct before the situation counts as
  // mastered and the run advances to the next one.
  const PLACEMENT_ORDER = ['gk', 'lb', 'rb', 'lm', 'cm', 'rm', 'st'];

  function shuffledSituations() {
    const arr = [...SITUATIONS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const [queue, setQueue] = useState(shuffledSituations);
  const [situationIndex, setSituationIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [placedCorrect, setPlacedCorrect] = useState([]); // slot ids mastered this situation
  const [mistakes, setMistakes] = useState(0);
  const [tap, setTap] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [phase, setPhase] = useState('placing'); // 'placing' | 'feedback' | 'situation_clear' | 'gameover' | 'champion'

  const situation = queue[situationIndex];
  const overrides = positionData[situation.id] || {};
  const ballPos = overrides.ball || { x: BALL_SLOT.x, y: BALL_SLOT.y };
  const currentSlotId = PLACEMENT_ORDER[stepIndex];
  const currentSlot = ALL_SLOTS.find((s) => s.id === currentSlotId);
  const target = overrides[currentSlotId] || { x: currentSlot.x, y: currentSlot.y };
  const player = findPlayer(assignments[currentSlotId]);
  const subjectLabel = player ? `${player.name} (${currentSlot.full})` : currentSlot.full;
  const livesLeft = MAX_MISTAKES - mistakes;

  function handleFieldTap(pt) {
    if (phase !== 'placing') return;
    const dx = Math.abs(pt.x - target.x);
    const dy = Math.abs(pt.y - target.y);
    const ok = dx <= 18 && dy <= 13;
    setTap(pt);
    setCorrect(ok);

    if (ok) {
      setPhase('feedback');
      setPlacedCorrect((prev) => [...prev, currentSlotId]);
    } else {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setPhase(nextMistakes >= MAX_MISTAKES ? 'gameover' : 'feedback');
    }
  }

  function handleNextStep() {
    const isLastSlot = stepIndex + 1 >= PLACEMENT_ORDER.length;
    setTap(null);
    setCorrect(null);
    if (isLastSlot) {
      const isLastSituation = situationIndex + 1 >= queue.length;
      setPhase(isLastSituation ? 'champion' : 'situation_clear');
    } else {
      setStepIndex((i) => i + 1);
      setPhase('placing');
    }
  }

  function handleRetrySlot() {
    // A wrong placement doesn't lose progress on the slots already
    // mastered this situation - just try the same slot again, same as
    // before, just costing one of the shared 3 mistakes.
    setTap(null);
    setCorrect(null);
    setPhase('placing');
  }

  function handleContinueToNextSituation() {
    setSituationIndex((i) => i + 1);
    setStepIndex(0);
    setPlacedCorrect([]);
    setTap(null);
    setCorrect(null);
    setPhase('placing');
  }

  function handleRestartRun() {
    setQueue(shuffledSituations());
    setSituationIndex(0);
    setStepIndex(0);
    setPlacedCorrect([]);
    setMistakes(0);
    setTap(null);
    setCorrect(null);
    setPhase('placing');
  }

  // Ball marker is always shown (auto-placed); placed-correct players are
  // added as they're mastered this situation. Nobody not-yet-placed shows,
  // which is what keeps this harder than the regular Match Day questions.
  const fieldMarkers = [
    { x: ballPos.x, y: ballPos.y, render: 'ball', label: 'Ball' },
    ...placedCorrect.map((slotId) => {
      const slot = ALL_SLOTS.find((s) => s.id === slotId);
      const pos = overrides[slotId] || { x: slot.x, y: slot.y };
      const pl = findPlayer(assignments[slotId]);
      return { x: pos.x, y: pos.y, render: 'player', shape: pl.shape, colors: pl.colors, eyeRow: pl.eyeRow, mouthRow: pl.mouthRow, label: slot.label };
    }),
  ];

  const showField = phase === 'placing' || phase === 'feedback';

  if (phase === 'champion') {
    return <ChampionScreen assignments={assignments} teamKit={teamKit} onPlayAgain={handleRestartRun} onExit={onExit} />;
  }

  return (
    <div className="pp-main">
      <div className="pp-field-col">
        {phase === 'gameover' ? (
          <div className="pp-field-empty-state">
            <div className="pp-xm-summary">
              <h2 className="pp-pixel" style={{ color: '#e63946' }}>GAME OVER</h2>
              <p className="pp-hint">3 wrong placements - that's the limit.</p>
              <p className="pp-hint">
                You made it through <b>{situationIndex}</b> of <b>{queue.length}</b> situations
                {situationIndex < queue.length ? <> and got <b>{placedCorrect.length}</b>/{PLACEMENT_ORDER.length} of the way through {situation.group} — {situation.side}</> : ''}.
              </p>
            </div>
          </div>
        ) : phase === 'situation_clear' ? (
          <div className="pp-field-empty-state">
            <div className="pp-xm-summary">
              <h2 className="pp-pixel" style={{ color: 'var(--accent-2)' }}>SITUATION MASTERED!</h2>
              <p className="pp-hint">{situation.group} — {situation.side}: all 7 positions correct.</p>
              <p className="pp-hint">{queue.length - situationIndex - 1} situation(s) to go.</p>
            </div>
          </div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="pp-coach-field" onClick={(e) => {
            if (phase === 'feedback') return;
            const { x, y } = fieldClickToPercent(e, W, H);
            handleFieldTap({ x: Math.max(1, Math.min(99, x)), y: Math.max(1, Math.min(99, y)) });
          }}>
            <FieldMarkings W={W} H={H} venue={venue} />
            {fieldMarkers.map((m, i) => renderContextMarker(m, `placed-${i}`, teamKit))}
            {tap && (() => {
              const px = (tap.x / 100) * W, py = (tap.y / 100) * H;
              const color = correct ? 'var(--accent-2)' : '#e63946';
              return (
                <g>
                  <line x1={px-8} y1={py-8} x2={px+8} y2={py+8} stroke={color} strokeWidth="3" strokeLinecap="round" />
                  <line x1={px-8} y1={py+8} x2={px+8} y2={py-8} stroke={color} strokeWidth="3" strokeLinecap="round" />
                </g>
              );
            })()}
            {phase === 'feedback' && !correct && (() => {
              const px = (target.x / 100) * W, py = (target.y / 100) * H;
              return <circle cx={px} cy={py} r="16" fill="none" stroke="var(--accent-2)" strokeWidth="3" />;
            })()}
          </svg>
        )}
      </div>

      <div className="pp-sidebar">
        <div className="pp-sidebar-inner">
          <div className="pp-xm-header">
            <span className="pp-pixel" style={{ color: 'var(--accent)', fontSize: '11px' }}>⚠ EXTREME MODE</span>
            <button className="pp-btn" onClick={onExit}>EXIT</button>
          </div>

          {phase !== 'gameover' && (
            <p className="pp-xm-lives">
              SITUATION {situationIndex + 1} / {queue.length} &middot; MISTAKES LEFT:{' '}
              {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                <span key={i} className={`pp-xm-life${i < livesLeft ? '' : ' used'}`}>⚽</span>
              ))}
            </p>
          )}

          {showField && (
            <>
              <p className="pp-hint">
                <b>{situation.group} — {situation.side}</b> &middot; position {stepIndex + 1} / {PLACEMENT_ORDER.length}
              </p>
              <p className="pp-question-prompt">
                Place {subjectLabel}. No reference markers — you've got this.
              </p>
              {phase === 'placing' && <p className="pp-hint" style={{ color: 'var(--accent)', fontSize: '11px' }}>👆 Tap the field to place</p>}
              {phase === 'feedback' && correct && (
                <div className="pp-result-panel">
                  <h2 className="pp-correct">CORRECT!</h2>
                  <button className="pp-btn primary full" onClick={handleNextStep}>
                    {stepIndex + 1 >= PLACEMENT_ORDER.length ? 'CONTINUE' : 'NEXT PLAYER'}
                  </button>
                </div>
              )}
            </>
          )}

          {phase === 'feedback' && !correct && (
            <div className="pp-result-panel">
              <h2 className="pp-incorrect">NOT QUITE</h2>
              <p className="pp-hint">{livesLeft} mistake(s) left before it's game over.</p>
              <button className="pp-btn primary full" onClick={handleRetrySlot}>TRY AGAIN</button>
            </div>
          )}

          {phase === 'situation_clear' && (
            <div className="pp-result-panel">
              <button className="pp-btn primary full" onClick={handleContinueToNextSituation}>NEXT SITUATION →</button>
            </div>
          )}

          {phase === 'gameover' && (
            <div className="pp-result-panel">
              <button className="pp-btn primary full" onClick={handleRestartRun}>TRY AGAIN</button>
              <button className="pp-btn full" onClick={onExit}>BACK TO MATCH</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
