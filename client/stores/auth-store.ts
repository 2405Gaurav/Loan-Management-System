import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, BorrowerProfile } from "@/lib/api";
import { getAuthMe } from "@/lib/api";
import { isStaffRole, type UserRole } from "@/lib/roles";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;

  setSession: (token: string, user: AuthUser) => void;
  updateUser: (user: AuthUser | BorrowerProfile) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
  fetchSession: () => Promise<AuthUser | null>;
  migrateLegacyStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hasHydrated: false,

      setSession: (token, user) => {
        set({ token, user });
      },

      updateUser: (user) => {
        const current = get().user;
        set({
          user: {
            ...current,
            ...user,
            id: user.id ?? current?.id ?? "",
            email: user.email ?? current?.email ?? "",
          } as AuthUser,
        });
      },

      clearSession: () => {
        set({ token: null, user: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),

      migrateLegacyStorage: () => {
        const { token, setSession } = get();
        if (token || typeof window === "undefined") return;

        const legacyToken = localStorage.getItem("token");
        const legacyUser = localStorage.getItem("user");
        if (!legacyToken || !legacyUser) return;

        try {
          const parsed = JSON.parse(legacyUser) as AuthUser;
          setSession(legacyToken, parsed);
        } catch {
          // ignore bad legacy data
        }
      },

      fetchSession: async () => {
        const { token, clearSession } = get();
        if (!token) return null;

        try {
          const { user } = await getAuthMe();
          set({ user });
          return user;
        } catch {
          clearSession();
          return null;
        }
      },
    }),
    {
      name: "creditsea-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.migrateLegacyStorage();
        state?.setHasHydrated(true);
      },
    }
  )
);

// Auth selectors — used by navbar, dashboard, route guards
export function selectIsAuthenticated(state: AuthState): boolean {
  return Boolean(state.token);
}

export function selectIsBorrower(state: AuthState): boolean {
  return state.user?.role === "BORROWER";
}

export function selectIsStaff(state: AuthState): boolean {
  return Boolean(state.user?.isStaff ?? isStaffRole(state.user?.role));
}

export function selectUserRole(state: AuthState): UserRole | undefined {
  return state.user?.role;
}
