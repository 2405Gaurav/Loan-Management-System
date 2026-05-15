"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BorrowerDashboard } from "@/components/dashboard/borrower-dashboard";
import { CollectionModule } from "@/components/dashboard/collection-module";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DisbursementModule } from "@/components/dashboard/disbursement-module";
import { SalesModule } from "@/components/dashboard/sales-module";
import { SanctionModule } from "@/components/dashboard/sanction-module";
import { getDashboardMeta, type DashboardModule } from "@/lib/api";
import { ROUTES } from "@/lib/navigation";
import {
  selectIsAuthenticated,
  selectIsBorrower,
  selectIsStaff,
  selectUserRole,
  useAuthStore,
} from "@/stores/auth-store";

function OpsModuleView({ module }: { module: DashboardModule }) {
  switch (module) {
    case "sales":
      return <SalesModule />;
    case "sanction":
      return <SanctionModule />;
    case "disbursement":
      return <DisbursementModule />;
    case "collection":
      return <CollectionModule />;
    default:
      return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isBorrower = useAuthStore(selectIsBorrower);
  const isStaff = useAuthStore(selectIsStaff);
  const role = useAuthStore(selectUserRole);
  const fetchSession = useAuthStore((s) => s.fetchSession);

  const [modules, setModules] = useState<DashboardModule[]>([]);
  const [activeModule, setActiveModule] = useState<DashboardModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.login);
      return;
    }

    async function init() {
      setLoading(true);
      setError("");

      try {
        await fetchSession();

        if (useAuthStore.getState().user?.role === "BORROWER") {
          setLoading(false);
          return;
        }

        if (!selectIsStaff(useAuthStore.getState())) {
          router.replace(ROUTES.login);
          return;
        }

        const meta = await getDashboardMeta();
        setModules(meta.modules);
        setActiveModule(meta.modules[0] ?? null);
      } catch (err: unknown) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : "Unable to load dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [hasHydrated, isAuthenticated, fetchSession, router]);

  if (!hasHydrated || loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </main>
    );
  }

  if (!isAuthenticated) return null;

  if (isBorrower) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <BorrowerDashboard />
      </main>
    );
  }

  if (error || !role || !activeModule) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-red-600">{error || "No modules available for your role."}</p>
      </main>
    );
  }

  return (
    <DashboardShell
      role={role}
      modules={modules}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      <OpsModuleView module={activeModule} />
    </DashboardShell>
  );
}
