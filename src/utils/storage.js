/* =========================================================================
   STORAGE
   Persists squad + coach position data across sessions via the artifact
   storage API. NOTE: window.storage only exists when this runs as a
   claude.ai artifact - the standalone HTML build has no persistence and
   will just keep everything in memory for that session.
   ========================================================================= */

const STORAGE_AVAILABLE = typeof window !== 'undefined' && !!window.storage;

export async function loadJSON(key, fallback) {
  if (!STORAGE_AVAILABLE) return fallback;
  try {
    const res = await window.storage.get(key);
    return res ? JSON.parse(res.value) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key, value) {
  if (!STORAGE_AVAILABLE) return;
  try {
    await window.storage.set(key, JSON.stringify(value));
  } catch {
    // best-effort; not fatal if a save fails
  }
}
