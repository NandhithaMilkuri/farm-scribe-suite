// Clears all old demo/test data from localStorage
// Run once on app startup to ensure clean state

const OLD_DATA_CLEARED_KEY = "AFMS_OLD_DATA_CLEARED_V2";

export function clearOldData() {
  if (localStorage.getItem(OLD_DATA_CLEARED_KEY)) return;

  // Remove all AFMS-related keys to start fresh
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("AFMS_")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  // Also clear any session data
  sessionStorage.removeItem("currentUser");

  // Mark as cleared so we don't wipe again
  localStorage.setItem(OLD_DATA_CLEARED_KEY, "true");
}
