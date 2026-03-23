// Clears old demo/test data from localStorage (one-time)
// Preserves user registrations and operator mappings

const OLD_DATA_CLEARED_KEY = "AFMS_OLD_DATA_CLEARED_V3";

export function clearOldData() {
  if (localStorage.getItem(OLD_DATA_CLEARED_KEY)) return;

  // Keys to PRESERVE (user data)
  const preserveKeys = new Set(["AFMS_USERS", "AFMS_OPERATOR_MAP"]);

  // Remove old demo data but keep user registrations
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("AFMS_") && !preserveKeys.has(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  // Clear old version markers
  localStorage.removeItem("AFMS_OLD_DATA_CLEARED_V2");

  sessionStorage.removeItem("currentUser");
  localStorage.setItem(OLD_DATA_CLEARED_KEY, "true");
}
