import type { AuthUser, BorrowerProfile } from "./api";
import { useAuthStore } from "@/stores/auth-store";

export function getToken(): string | null {
  return useAuthStore.getState().token;
}

export function getStoredUser(): AuthUser | null {
  return useAuthStore.getState().user;
}

export function saveStoredUser(user: AuthUser | BorrowerProfile): void {
  useAuthStore.getState().updateUser(user);
}

export function clearAuth(): void {
  useAuthStore.getState().clearSession();
}

export function isLoggedIn(): boolean {
  return Boolean(useAuthStore.getState().token);
}
