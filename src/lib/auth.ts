export type UserRole = "operator" | "supervisor" | "organizer";

export interface User {
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
}

export interface CurrentUser {
  username: string;
  role: UserRole;
  fullName: string;
}

const USERS_KEY = "AFMS_USERS";

export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(user: User): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.find((u) => u.username === user.username)) {
    return { success: false, error: "Username already exists" };
  }
  users.push(user);
  saveUsers(users);
  return { success: true };
}

export function loginUser(username: string, password: string): { success: boolean; user?: CurrentUser; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return { success: false, error: "Invalid username or password" };
  const currentUser: CurrentUser = { username: user.username, role: user.role, fullName: user.fullName };
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
  return { success: true, user: currentUser };
}

export function getCurrentUser(): CurrentUser | null {
  const data = sessionStorage.getItem("currentUser");
  return data ? JSON.parse(data) : null;
}

export function logout() {
  sessionStorage.removeItem("currentUser");
}

// Seed demo users if none exist
export function seedDemoUsers() {
  const users = getUsers();
  if (users.length > 0) return;
  const demos: User[] = [
    { username: "nandhitha", password: "pass123", role: "operator", fullName: "Nandhitha K" },
    { username: "arun", password: "pass123", role: "operator", fullName: "Arun V" },
    { username: "ramesh", password: "pass123", role: "supervisor", fullName: "Ramesh S" },
    { username: "suresh", password: "pass123", role: "supervisor", fullName: "Suresh M" },
    { username: "priya", password: "pass123", role: "organizer", fullName: "Priya R" },
  ];
  saveUsers(demos);
}
