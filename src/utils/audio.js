/* =========================================================================
   CELEBRATION / THEME AUDIO
   Synthesized chiptune-style audio - no external audio assets needed. Safe
   to call from any user-gesture handler.
   ========================================================================= */

// Short synthesized fanfare. Safe to call from any user-gesture handler
// (tap to take the free kick, etc.).
export function playGoalSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const start = now + i * 0.1;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Audio not available - fail silently.
  }
}

// Original 8-bit-style intro song - a full ~9.5 second composed piece
// (not a short repeating loop) that plays through pickup -> hook -> hook
// variation -> contrasting bridge -> final cadence, then repeats from the
// top if nobody has picked an option yet. Returns a controller object
// with stop(); the intro screen calls stop() the moment the player picks
// an option, and on unmount as a safety net.
export function startIntroTheme() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return { stop() {} };

  let ctx;
  try {
    ctx = new Ctx();
  } catch {
    return { stop() {} };
  }

  let stopped = false;
  let timerId = null;

  // C major scale across a couple octaves, plus the root notes used in the
  // bass line below (A3/F3/G3/C4 for a I-vi-IV-V-flavored progression).
  const N = {
    D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
    C6: 1046.50,
    C4: 261.63, A3: 220.00, F3: 174.61, G3: 196.00,
  };
  const STEP = 0.25; // eighth-note grid, seconds
  const SONG_LEN = 9.5; // full piece length before it loops back to the top

  function note(freq, start, dur, type, vol) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  // Lead melody, written on the STEP grid (each entry is [note, numSteps]).
  // null = rest. Structure: pickup -> A -> A' (reaches higher) -> B
  // (lower register, bouncier contrast) -> tag (big finish, holds the
  // tonic at the end so the loop point doesn't feel abrupt).
  const LEAD = [
    // pickup (4 steps)
    ['G4', 1], ['A4', 1], ['B4', 1], ['C5', 1],
    // A (8 steps)
    ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['F5', 1], ['D5', 1], ['G5', 1], ['E5', 1],
    // A' (8 steps) - same shape, reaches higher
    ['C5', 1], ['E5', 1], ['G5', 1], ['C6', 1], ['A5', 1], ['F5', 1], ['E5', 1], ['D5', 1],
    // B (8 steps) - lower register, bouncier, deliberate contrast
    ['G4', 1], [null, 1], ['A4', 1], ['G4', 1], ['F4', 1], [null, 1], ['E4', 1], ['D4', 1],
    // tag (10 steps) - final flourish, holds the tonic
    ['E5', 1], ['G5', 1], ['C6', 1], ['G5', 1], ['E5', 1], ['D5', 1], ['C5', 4],
  ];

  // Bass line - one root note per bar (mostly), following the same
  // pickup/A/A'/B/tag structure so it lands on the chord the melody implies.
  const BASS = [
    ['C4', 0, 4],
    ['C4', 4, 4], ['A3', 8, 4],
    ['F3', 12, 4], ['G3', 16, 4],
    ['C4', 20, 4], ['A3', 24, 4],
    ['F3', 28, 4], ['C4', 32, 6],
  ];

  function scheduleSong() {
    if (stopped) return;
    const base = ctx.currentTime;

    let t = 0;
    LEAD.forEach(([name, steps]) => {
      if (name) note(N[name], base + t * STEP, steps * STEP * 0.92, 'square', 0.15);
      t += steps;
    });

    BASS.forEach(([name, startStep, steps]) => {
      note(N[name], base + startStep * STEP, steps * STEP * 0.9, 'triangle', 0.10);
    });

    timerId = setTimeout(scheduleSong, SONG_LEN * 1000);
  }

  scheduleSong();

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      if (timerId) clearTimeout(timerId);
      try { ctx.close(); } catch {}
    },
  };
}

// Looping victory fanfare for the champion screen - faster and brighter
// than the intro theme, with a punchy repeated "ta-da" character. Same
// controller pattern as startIntroTheme (stop() cancels the loop and
// closes the audio context).
export function startChampionFanfare() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return { stop() {} };

  let ctx;
  try {
    ctx = new Ctx();
  } catch {
    return { stop() {} };
  }

  let stopped = false;
  let timerId = null;

  const N = {
    C3: 130.81, G3: 196.00,
    C4: 261.63, E4: 329.63, G4: 392.00,
    C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.50,
  };
  const STEP = 0.16;
  const LOOP_LEN = 8 * STEP; // 1.28s - short, punchy, repeats fast

  function note(freq, start, dur, type, vol) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  const LEAD = [
    ['C5', 1], ['E5', 1], ['G5', 1], ['C6', 1], ['G5', 1], ['E5', 1], ['C6', 2],
  ];

  function scheduleLoop() {
    if (stopped) return;
    const base = ctx.currentTime;
    let t = 0;
    LEAD.forEach(([name, steps]) => {
      note(N[name], base + t * STEP, steps * STEP * 0.9, 'square', 0.17);
      t += steps;
    });
    note(N.C3, base, STEP * 8 * 0.85, 'triangle', 0.13);
    note(N.G3, base + 4 * STEP, STEP * 4 * 0.85, 'triangle', 0.1);
    timerId = setTimeout(scheduleLoop, LOOP_LEN * 1000);
  }

  scheduleLoop();

  return {
    stop() {
      if (stopped) return;
      stopped = true;
      if (timerId) clearTimeout(timerId);
      try { ctx.close(); } catch {}
    },
  };
}
