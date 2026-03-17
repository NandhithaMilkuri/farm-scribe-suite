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

// Village assignments
interface VillageAssignment {
  village: string;
  supervisors: string[];
  organizers: string[];
}

const ASSIGNMENTS_KEY = "AFMS_VILLAGE_ASSIGNMENTS";

export function getVillageAssignments(): VillageAssignment[] {
  return JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) || "[]");
}

export function setVillageAssignments(assignments: VillageAssignment[]) {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export function getAssignedVillages(username: string, role: UserRole): string[] {
  const assignments = getVillageAssignments();
  return assignments
    .filter((a) =>
      role === "supervisor" ? a.supervisors.includes(username) : a.organizers.includes(username)
    )
    .map((a) => a.village);
}

// Leave management
export interface LeaveRequest {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: string;
}

const LEAVES_KEY = "AFMS_LEAVES";

export function getLeaveRequests(): LeaveRequest[] {
  return JSON.parse(localStorage.getItem(LEAVES_KEY) || "[]");
}

export function saveLeaveRequests(leaves: LeaveRequest[]) {
  localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
}
