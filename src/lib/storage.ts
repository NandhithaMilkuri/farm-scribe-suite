import { getCurrentUser, getMyOperator, type UserRole } from "./auth";

function getStorageKey(role: UserRole, username: string): string {
  return `AFMS_DATA_${role}_${username}`;
}

export function getUserData<T = Record<string, unknown>>(): T {
  const user = getCurrentUser();
  if (!user) return {} as T;
  const key = getStorageKey(user.role, user.username);
  return JSON.parse(localStorage.getItem(key) || "{}") as T;
}

export function setUserData(data: Record<string, unknown>) {
  const user = getCurrentUser();
  if (!user) return;
  const key = getStorageKey(user.role, user.username);
  const existing = JSON.parse(localStorage.getItem(key) || "{}");
  localStorage.setItem(key, JSON.stringify({ ...existing, ...data }));
}

// ── Operator-namespaced shared data ──
// Each operator has their own set of villages, farmers, crops, salaries etc.

function sharedKey(operatorUsername: string): string {
  return `AFMS_SHARED_${operatorUsername}`;
}

/** Get shared data for the current user's operator namespace */
export function getSharedData<T = Record<string, unknown>>(): T {
  const op = getMyOperator();
  if (!op) return {} as T;
  return JSON.parse(localStorage.getItem(sharedKey(op)) || "{}") as T;
}

/** Set shared data in the current user's operator namespace */
export function setSharedData(data: Record<string, unknown>) {
  const op = getMyOperator();
  if (!op) return;
  const key = sharedKey(op);
  const existing = JSON.parse(localStorage.getItem(key) || "{}");
  localStorage.setItem(key, JSON.stringify({ ...existing, ...data }));
}

// Get data for a specific user (for cross-role viewing)
export function getSpecificUserData(role: UserRole, username: string): Record<string, unknown> {
  const key = getStorageKey(role, username);
  return JSON.parse(localStorage.getItem(key) || "{}");
}

// Get all users' data for a specific role
export function getAllDataForRole(role: UserRole): Array<{ username: string; data: Record<string, unknown> }> {
  const results: Array<{ username: string; data: Record<string, unknown> }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(`AFMS_DATA_${role}_`)) {
      const username = key.replace(`AFMS_DATA_${role}_`, "");
      results.push({ username, data: JSON.parse(localStorage.getItem(key) || "{}") });
    }
  }
  return results;
}
