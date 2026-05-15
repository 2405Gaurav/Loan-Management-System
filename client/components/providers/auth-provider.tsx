"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

// Hydrates persisted auth and refreshes user from API when token exists
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const fetchSession = useAuthStore((s) => s.fetchSession);
  const migrateLegacyStorage = useAuthStore((s) => s.migrateLegacyStorage);

  useEffect(() => {
    migrateLegacyStorage();
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.getState().setHasHydrated(true);
    });
    useAuthStore.persist.rehydrate();
    return unsub;
  }, [migrateLegacyStorage]);

  useEffect(() => {
    if (!hasHydrated || !token) return;
    fetchSession();
  }, [hasHydrated, token, fetchSession]);

  return <>{children}</>;
}
