/* =========================================================================
   STORAGE
   Persists each player's teams and coach data in the browser's
   localStorage, namespaced by a lightweight "profile" (just a player name,
   no password/account) so multiple kids sharing one device each keep
   their own teams and progress separate.
   ========================================================================= */

const STORAGE_AVAILABLE = typeof window !== 'undefined' && !!window.localStorage;

const PROFILES_KEY = 'pixel-pitch-fc:profiles';
const CURRENT_PROFILE_KEY = 'pixel-pitch-fc:current-profile';

function profileDataKey(name) {
  return `pixel-pitch-fc:profile:${name}`;
}

function safeParse(json, fallback) {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function listProfiles() {
  if (!STORAGE_AVAILABLE) return [];
  return safeParse(window.localStorage.getItem(PROFILES_KEY), []);
}

export function getCurrentProfileName() {
  if (!STORAGE_AVAILABLE) return null;
  return window.localStorage.getItem(CURRENT_PROFILE_KEY) || null;
}

// Marks `name` as the active profile and adds it to the known-profiles list
// (a no-op if it's already known) so it shows up as a "play as" option the
// next time someone opens the Who's Playing screen.
export function setCurrentProfileName(name) {
  if (!STORAGE_AVAILABLE) return;
  window.localStorage.setItem(CURRENT_PROFILE_KEY, name);
  const profiles = listProfiles();
  if (!profiles.includes(name)) {
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify([...profiles, name]));
  }
}

// Clears which profile is "logged in" without deleting that profile's
// saved data, so picking the same name again later resumes right where
// they left off.
export function clearCurrentProfileName() {
  if (!STORAGE_AVAILABLE) return;
  window.localStorage.removeItem(CURRENT_PROFILE_KEY);
}

export function loadProfileData(name, fallback) {
  if (!STORAGE_AVAILABLE) return fallback;
  return safeParse(window.localStorage.getItem(profileDataKey(name)), fallback);
}

export function saveProfileData(name, data) {
  if (!STORAGE_AVAILABLE) return;
  try {
    window.localStorage.setItem(profileDataKey(name), JSON.stringify(data));
  } catch {
    // best-effort; not fatal if a save fails (e.g. storage full/disabled)
  }
}
