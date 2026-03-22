import { supabase } from "@/integrations/supabase/client";

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

/** Only operators can self-register */
export function registerOperator(user: Omit<User, "role">): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.find((u) => u.username === user.username)) {
    return { success: false, error: "Username already exists" };
  }
  if (users.find((u) => u.phone === user.phone)) {
    return { success: false, error: "Phone number already registered" };
  }
  users.push({ ...user, role: "operator" });
  saveUsers(users);
  return { success: true };
}

/** Operator creates staff (supervisor/organizer) under their namespace */
export function createStaffAccount(
  operatorUsername: string,
  staff: { username: string; password: string; fullName: string; phone: string; role: "supervisor" | "organizer" }
): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.find((u) => u.username === staff.username)) {
    return { success: false, error: "Username already exists" };
  }
  if (users.find((u) => u.phone === staff.phone)) {
    return { success: false, error: "Phone number already registered" };
  }
  users.push({
    username: staff.username,
    password: staff.password,
    role: staff.role,
    fullName: staff.fullName,
    phone: staff.phone,
  });
  saveUsers(users);
  // Map this staff to the operator
  setOperatorForUser(staff.username, operatorUsername);
  return { success: true };
}

/** Get staff members created by a specific operator */
export function getOperatorStaff(operatorUsername: string): User[] {
  const map = getOperatorMap();
  const users = getUsers();
  return users.filter((u) => map[u.username] === operatorUsername);
}

export function loginUser(username: string, password: string, expectedRole?: string): { success: boolean; user?: CurrentUser; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return { success: false, error: "Invalid username or password" };
  if (expectedRole && user.role !== expectedRole) {
    return { success: false, error: `This account is not registered as ${expectedRole}. Please select the correct role.` };
  }
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

/** Send real SMS via Twilio edge function */
export async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("send-sms", {
      body: { to, message },
    });
    if (error) return { success: false, error: error.message };
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || "SMS failed" };
  }
}

/** Send OTP via real SMS */
export async function sendOTP(phone: string): Promise<{ success: boolean; otp?: string; error?: string }> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const result = await sendSMS(phone, `Your Nutranta verification code is: ${otp}. Do not share this with anyone.`);
  if (result.success) {
    // Store OTP temporarily (in production use server-side storage)
    sessionStorage.setItem(`otp_${phone}`, JSON.stringify({ otp, expires: Date.now() + 5 * 60 * 1000 }));
    return { success: true, otp };
  }
  return { success: false, error: result.error || "Failed to send OTP" };
}

export function verifyOTP(phone: string, inputOtp: string): boolean {
  const stored = sessionStorage.getItem(`otp_${phone}`);
  if (!stored) return false;
  const { otp, expires } = JSON.parse(stored);
  if (Date.now() > expires) { sessionStorage.removeItem(`otp_${phone}`); return false; }
  if (otp === inputOtp) { sessionStorage.removeItem(`otp_${phone}`); return true; }
  return false;
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
