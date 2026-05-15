import type { AuthUser, BorrowerProfile } from "./api";

// Read JWT token from browser storage
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Read cached user from browser storage
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// Save user object after login/signup/profile update
export function saveStoredUser(user: AuthUser | BorrowerProfile): void {
  localStorage.setItem("user", JSON.stringify(user));
}

// Remove auth data on logout
export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Quick check if user appears logged in on client
export function isLoggedIn(): boolean {
  return Boolean(getToken());
}
