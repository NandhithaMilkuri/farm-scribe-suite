export type UserRole = "operator" | "supervisor" | "organizer";

export interface User {
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  phone: string;
}

export interface CurrentUser {
  username: string;
  role: UserRole;
  fullName: string;
  phone: string;
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
  if (users.find((u) => u.phone === user.phone)) {
    return { success: false, error: "Phone number already registered" };
  }
  users.push(user);
  saveUsers(users);
  return { success: true };
}

export function loginUser(username: string, password: string): { success: boolean; user?: CurrentUser; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return { success: false, error: "Invalid username or password" };
  const currentUser: CurrentUser = { username: user.username, role: user.role, fullName: user.fullName, phone: user.phone };
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

export function getUserByPhone(phone: string): User | undefined {
  return getUsers().find((u) => u.phone === phone);
}

export function resetPasswordByPhone(phone: string, newPassword: string): { success: boolean; error?: string } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.phone === phone);
  if (idx === -1) return { success: false, error: "Phone number not found" };
  if (newPassword.length < 4) return { success: false, error: "Password must be at least 4 characters" };
  users[idx].password = newPassword;
  saveUsers(users);
  return { success: true };
}

// ── Operator Mapping ──
// Tracks which operator each supervisor/organizer belongs to.
// When operator assigns a village to a user, that user is mapped to the operator.
const OPERATOR_MAP_KEY = "AFMS_OPERATOR_MAP";

export function getOperatorMap(): Record<string, string> {
  return JSON.parse(localStorage.getItem(OPERATOR_MAP_KEY) || "{}");
}

export function setOperatorForUser(username: string, operatorUsername: string) {
  const map = getOperatorMap();
  map[username] = operatorUsername;
  localStorage.setItem(OPERATOR_MAP_KEY, JSON.stringify(map));
}

/** Returns the operator username whose data namespace this user belongs to */
export function getMyOperator(): string {
  const user = getCurrentUser();
  if (!user) return "";
  if (user.role === "operator") return user.username;
  const map = getOperatorMap();
  return map[user.username] || "";
}

// ── Village assignments (per operator) ──
interface VillageAssignment {
  village: string;
  supervisors: string[];
  organizers: string[];
}

function assignmentsKey(operatorUsername: string): string {
  return `AFMS_VILLAGE_ASSIGNMENTS_${operatorUsername}`;
}

export function getVillageAssignments(operatorUsername: string): VillageAssignment[] {
  if (!operatorUsername) return [];
  return JSON.parse(localStorage.getItem(assignmentsKey(operatorUsername)) || "[]");
}

export function setVillageAssignments(operatorUsername: string, assignments: VillageAssignment[]) {
  localStorage.setItem(assignmentsKey(operatorUsername), JSON.stringify(assignments));
}

export function getAssignedVillages(username: string, role: UserRole): string[] {
  const op = role === "operator" ? username : getOperatorMap()[username] || "";
  if (!op) return [];
  const assignments = getVillageAssignments(op);
  if (role === "operator") return assignments.map((a) => a.village);
  return assignments
    .filter((a) =>
      role === "supervisor" ? a.supervisors.includes(username) : a.organizers.includes(username)
    )
    .map((a) => a.village);
}

// ── Leave management (per operator namespace) ──
export interface LeaveRequest {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
  operatorNamespace: string; // which operator's team
}

function leavesKey(operatorUsername: string): string {
  return `AFMS_LEAVES_${operatorUsername}`;
}

export function getLeaveRequests(operatorUsername: string): LeaveRequest[] {
  if (!operatorUsername) return [];
  return JSON.parse(localStorage.getItem(leavesKey(operatorUsername)) || "[]");
}

export function saveLeaveRequests(operatorUsername: string, leaves: LeaveRequest[]) {
  localStorage.setItem(leavesKey(operatorUsername), JSON.stringify(leaves));
}
