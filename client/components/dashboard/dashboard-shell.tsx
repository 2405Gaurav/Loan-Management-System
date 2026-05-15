"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/lib/navigation";
import type { DashboardModule } from "@/lib/api";
import type { UserRole } from "@/lib/roles";

const MODULE_LABELS: Record<DashboardModule, string> = {
  sales: "Sales",
  sanction: "Sanction",
  disbursement: "Disbursement",
  collection: "Collection",
};

interface DashboardShellProps {
  role: UserRole;
  modules: DashboardModule[];
  activeModule: DashboardModule;
  onModuleChange: (module: DashboardModule) => void;
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  modules,
  activeModule,
  onModuleChange,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  function handleLogout() {
    clearSession();
    router.push(ROUTES.login);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Operations Dashboard</p>
            <p className="text-xs text-slate-500">Role: {role}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={ROUTES.home} className="text-sm text-brand-600 hover:underline">
              Public site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {modules.length > 1 && (
        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl gap-1 px-4">
            {modules.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => onModuleChange(mod)}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeModule === mod
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {MODULE_LABELS[mod]}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
