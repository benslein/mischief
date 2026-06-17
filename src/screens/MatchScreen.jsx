import { useState } from 'react';
import { FORMATION_2_3_1, UNLOCKABLE_ROSTER, findPlayer } from '../data/gameData.js';
import { checkAnswer, fieldClickToPercent, generateQuestion, renderContextMarker } from '../utils/fieldLogic.jsx';
import { getBallRects, kitColors, PixelSprite } from '../utils/sprites.jsx';
import { playGoalSound } from '../utils/audio.js';
import FieldMarkings from '../components/FieldMarkings.jsx';
import { FK_ZONES, DivingKeeper } from '../components/FreeKick.jsx';
import Confetti from '../components/Confetti.jsx';
import CelebratingPlayer from '../components/CelebratingPlayer.jsx';

/* =========================================================================
   MATCH DAY SCREEN
   ========================================================================= */

export default function MatchScreen({ assignments, positionData, questionBank, venue, teamKit, onMatchComplete, record, newlyUnlocked, onDismissUnlock }) {
  const [score, setScore] = useState({ us: 0, them: 0 });
  const [streak, setStreak] = useState(0);
  const [minutesElapsed, setMinutesElapsed] = useState(0);
  const [question, setQuestion] = useState(() => generateQuestion(assignments, positionData, questionBank));
  const [usedKeys, setUsedKeys] = useState(() => [question.key]);
  const [tap, setTap] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [phase, setPhase] = useState('question'); // 'question' | 'feedback' | 'freekick' | 'fulltime'
  const [pendingFreeKick, setPendingFreeKick] = useState(false);
  const [opponentScored, setOpponentScored] = useState(false);
  const [freekick, setFreekick] = useState({ pick: null, keeperPick: null });

  function handleTap(pt) {
    const ok = checkAnswer(question, pt);
    setTap(pt);
    setCorrect(ok);
    setPhase('feedback');
    setOpponentScored(false);
    setMinutesElapsed((m) => Math.min(90, m + 5));
    if (ok) {
      const next = streak + 1;
      if (next >= 3) {
        setStreak(0);
        setPendingFreeKick(true);
      } else {
        setStreak(next);
        setPendingFreeKick(false);
      }
    } else {
      setStreak(0);
      setPendingFreeKick(false);
      if (Math.random() < 0.25) {
        setScore((s) => ({ ...s, them: s.them + 1 }));
        setOpponentScored(true);
      }
    }
  }

  function nextQuestion() {
    let q = generateQuestion(assignments, positionData, questionBank);
    let attempts = 0;
    while (usedKeys.includes(q.key) && attempts < 200) {
      q = generateQuestion(assignments, positionData, questionBank);
      attempts++;
    }
    setQuestion(q);
    setUsedKeys((prev) => [...prev, q.key]);
    setTap(null);
    setCorrect(null);
    setOpponentScored(false);
    setPhase('question');
  }

  function proceedAfterFeedback() {
    if (minutesElapsed >= 90) {
      setPhase('fulltime');
      if (score.us > score.them) playGoalSound();
      if (onMatchComplete) {
        const result = score.us > score.them ? 'win' : score.us < score.them ? 'loss' : 'draw';
        onMatchComplete(result);
      }
    } else {
      nextQuestion();
    }
  }

  function handleContinue() {
    if (pendingFreeKick) {
      setPendingFreeKick(false);
      setFreekick({ pick: null, keeperPick: null });
      setPhase('freekick');
      return;
    }
    proceedAfterFeedback();
  }

  function handleFreeKickPick(zone) {
    if (freekick.pick) return;
    const keeper = FK_ZONES[Math.floor(Math.random() * 3)];
    const goal = zone !== keeper;
    setFreekick({ pick: zone, keeperPick: keeper });
    if (goal) {
      setScore((s) => ({ ...s, us: s.us + 1 }));
      playGoalSound();
    }
  }

  function handleRestart() {
    setScore({ us: 0, them: 0 });
    setStreak(0);
    setMinutesElapsed(0);
    setPendingFreeKick(false);
    setOpponentScored(false);
    setFreekick({ pick: null, keeperPick: null });
    setTap(null);
    setCorrect(null);
    if (onDismissUnlock) onDismissUnlock();
    const q = generateQuestion(assignments, positionData, questionBank);
    setQuestion(q);
    setUsedKeys([q.key]);
    setPhase('question');
  }

  const W = 300, H = 440;
  const isGoal = freekick.pick && freekick.pick !== freekick.keeperPick;

  return (
    <div className="pp-main">
      {/* Left: field or free kick */}
      {phase === 'freekick' ? (
        <div className="pp-fk-col">
          <svg viewBox="0 0 300 160" role="img" aria-label="Free kick - pick a side">
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={`grass-${i}`} x="0" y={i * 20} width="300" height="20" fill={i % 2 === 0 ? 'var(--field-1)' : 'var(--field-2)'} />
            ))}
            <rect x="40" y="18" width="220" height="52" fill="#16271d" opacity="0.55" />
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`nv${i}`} x1={40 + i * (220/6)} y1="18" x2={40 + i * (220/6)} y2="70" stroke="#ffffff" strokeWidth="0.6" opacity="0.3" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`nh${i}`} x1="40" y1={18 + i * (52/4)} x2="260" y2={18 + i * (52/4)} stroke="#ffffff" strokeWidth="0.6" opacity="0.3" />
            ))}
            <path d="M 40 70 L 40 18 L 260 18 L 260 70" fill="none" stroke="#e8e8e8" strokeWidth="2" />
            <line x1="10" y1="10" x2="40" y2="18" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="290" y1="10" x2="260" y2="18" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="10" y1="90" x2="40" y2="70" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
            <line x1="290" y1="90" x2="260" y2="70" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
            <path d="M 10 90 L 10 10 L 290 10 L 290 90" fill="none" stroke="#ffffff" strokeWidth="4.5" strokeLinejoin="round" />
            {FK_ZONES.map((z, i) => {
              const zoneW = (300 - 20) / 3;
              return (
                <line key={z} x1={10 + (i + 1) * zoneW} y1="10" x2={10 + (i + 1) * zoneW} y2="90" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              );
            }).slice(0, 2)}
            {!freekick.pick && FK_ZONES.map((z, i) => {
              const zoneW = (300 - 20) / 3;
              return <rect key={z} x={10 + i * zoneW} y="10" width={zoneW} height="80" fill="transparent" className="pp-fk-zone" onClick={() => handleFreeKickPick(z)} />;
            })}
            {freekick.keeperPick && (() => {
              const zoneW = (300 - 20) / 3;
              const i = FK_ZONES.indexOf(freekick.keeperPick);
              const cx = 10 + i * zoneW + zoneW / 2;
              return <DivingKeeper direction={freekick.keeperPick} cx={cx} />;
            })()}
            {freekick.pick && (() => {
              const zoneW = (300 - 20) / 3;
              const i = FK_ZONES.indexOf(freekick.pick);
              const cx = 10 + i * zoneW + zoneW / 2;
              const cy = freekick.pick === freekick.keeperPick ? 40 : 80;
              const scale = 2.5;
              return <g transform={`translate(${cx - 4 * scale} ${cy - 4 * scale}) scale(${scale})`}>{getBallRects()}</g>;
            })()}
          </svg>
        </div>
      ) : phase === 'fulltime' ? (
        <div className="pp-fk-col">
          {score.us > score.them && <Confetti count={48} />}
          {score.us > score.them && (
            <div className="pp-celebration">
              {FORMATION_2_3_1.map((slot, i) => {
                const player = findPlayer(assignments[slot.id]);
                if (!player) return null;
                return <CelebratingPlayer key={slot.id} player={player} size={52} delay={i * 0.08} kit={(colors) => kitColors(colors, teamKit)} />;
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="pp-field-col">
          <svg viewBox={`0 0 ${W} ${H}`} className="pp-coach-field" onClick={(e) => {
            if (phase === 'feedback') return;
            const { x, y } = fieldClickToPercent(e, W, H);
            handleTap({ x: Math.max(1, Math.min(99, x)), y: Math.max(1, Math.min(99, y)) });
          }}>
            <FieldMarkings W={W} H={H} venue={venue} />
            {question.context && question.context.map((m, i) => renderContextMarker(m, `ctx-${i}`, teamKit))}
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
            {phase === 'feedback' && !correct && question.target && (() => {
              const px = (question.target.x / 100) * W, py = (question.target.y / 100) * H;
              return <circle cx={px} cy={py} r="16" fill="none" stroke="var(--accent-2)" strokeWidth="3" />;
            })()}
            {phase === 'feedback' && !correct && question.zones && question.zones.map((z, i) => {
              const x = (z.xMin / 100) * W, y = (z.yMin / 100) * H;
              const w = ((z.xMax - z.xMin) / 100) * W, h = ((z.yMax - z.yMin) / 100) * H;
              return <rect key={i} x={x} y={y} width={w} height={h} fill="var(--accent-2)" opacity="0.25" stroke="var(--accent-2)" strokeWidth="2" strokeDasharray="4 3" />;
            })}
          </svg>
        </div>
      )}

      {/* Right: sidebar */}
      <div className="pp-sidebar">
        <div className="pp-sidebar-inner">
          {/* Scoreboard */}
          <div className="pp-scoreboard">
            <div className="pp-score-side">
              <span className="pp-score-label pp-pixel">US</span>
              <span className="pp-score-num">{score.us}</span>
            </div>
            <div className="pp-streak">
              {[1,2,3].map((i) => <span key={i} className={`pp-streak-dot${i <= streak ? ' on' : ''}`} />)}
            </div>
            <div className="pp-score-side">
              <span className="pp-score-label pp-pixel">THEM</span>
              <span className="pp-score-num">{score.them}</span>
            </div>
          </div>

          {/* Clock */}
          <div className="pp-clock">
            <div className="pp-clock-bar">
              <div className={`pp-clock-fill${minutesElapsed >= 90 ? ' full' : ''}`} style={{ width: `${(minutesElapsed / 90) * 100}%` }} />
            </div>
            <span className="pp-clock-label">{minutesElapsed}' / 90'</span>
          </div>

          <hr className="pp-divider" />

          {/* Question phase */}
          {phase !== 'freekick' && phase !== 'fulltime' && (
            <>
              <p className="pp-question-prompt">
                {question.type === 'terminology' && question.term && <b>{question.term}: </b>}
                {question.prompt}
              </p>
              {phase === 'question' && <p className="pp-hint" style={{ color: 'var(--accent)', fontSize: '11px' }}>👆 Tap the field to answer</p>}
              {phase === 'feedback' && (
                <div className="pp-result-panel">
                  <h2 className={correct ? 'pp-correct' : 'pp-incorrect'}>{correct ? 'CORRECT!' : 'NOT QUITE'}</h2>
                  {opponentScored && <p className="pp-opponent-score">Unmarked space — they score!</p>}
                  {pendingFreeKick && <p>3 in a row! Free kick earned.</p>}
                </div>
              )}
            </>
          )}

          {/* Free kick phase */}
          {phase === 'freekick' && (
            <>
              <p className="pp-hint">{freekick.pick ? '' : 'Pick a side of the goal.'}</p>
              {!freekick.pick && (
                <div className="pp-chip-row" style={{ justifyContent: 'center' }}>
                  {FK_ZONES.map((z) => (
                    <button key={z} className="pp-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleFreeKickPick(z)}>
                      {z === 'L' ? '← LEFT' : z === 'R' ? 'RIGHT →' : 'CENTER'}
                    </button>
                  ))}
                </div>
              )}
              {freekick.pick && (
                <div className="pp-result-panel">
                  {isGoal && <Confetti count={24} />}
                  <h2 className={isGoal ? 'pp-correct' : 'pp-incorrect'}>{isGoal ? 'GOAL!' : 'SAVED!'}</h2>
                </div>
              )}
            </>
          )}

          {/* Full time */}
          {phase === 'fulltime' && (
            <div className="pp-result-panel">
              {score.us > score.them && <Confetti count={32} />}
              <h2 className="pp-pixel" style={{ color: 'var(--accent-2)' }}>FULL TIME</h2>
              <span className="pp-final-score">{score.us} – {score.them}</span>
              <p>
                {score.us > score.them ? 'You won the match!' : score.us < score.them ? "Tough one — let's run it back." : "It's a draw!"}
              </p>
              {score.us > score.them && newlyUnlocked && (() => {
                const newPlayer = UNLOCKABLE_ROSTER.find((p) => p.id === newlyUnlocked);
                if (!newPlayer) return null;
                return (
                  <div className="pp-unlock-banner">
                    <p className="pp-pixel pp-unlock-title">NEW PLAYER UNLOCKED!</p>
                    <PixelSprite shape={newPlayer.shape} colors={kitColors(newPlayer.colors, teamKit)} eyeRow={newPlayer.eyeRow} mouthRow={newPlayer.mouthRow} size={64} />
                    <p className="pp-unlock-name">{newPlayer.name}</p>
                    <p className="pp-unlock-tag">{newPlayer.tag}</p>
                    <p className="pp-hint">Find them on the bench in Squad.</p>
                  </div>
                );
              })()}
              {record && (
                <p className="pp-intro-record">
                  ALL-TIME RECORD: <span className="pp-record-w">{record.wins}W</span>
                  {' '}<span className="pp-record-l">{record.losses}L</span>
                  {' '}<span className="pp-record-d">{record.draws}D</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer: pinned outside the scrollable area so the primary action
            is always reachable without scrolling, even on short phones. */}
        {(phase === 'feedback' || (phase === 'freekick' && freekick.pick) || phase === 'fulltime') && (
          <div className="pp-sidebar-footer">
            {phase === 'feedback' && (
              <button className="pp-btn primary full" onClick={handleContinue}>
                {pendingFreeKick ? 'TAKE FREE KICK' : 'NEXT QUESTION'}
              </button>
            )}
            {phase === 'freekick' && freekick.pick && (
              <button className="pp-btn primary full" onClick={proceedAfterFeedback}>NEXT QUESTION</button>
            )}
            {phase === 'fulltime' && (
              <button className="pp-btn primary full" onClick={handleRestart}>PLAY AGAIN</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
