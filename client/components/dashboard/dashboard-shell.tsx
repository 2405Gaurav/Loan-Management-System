"use client";

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
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <p className="text-base font-semibold text-slate-900 sm:text-lg">
            Operations Dashboard
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Role: {role}</p>
        </div>
      </header>

      {modules.length > 1 && (
        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
            <div className="flex min-w-max gap-1">
              {modules.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => onModuleChange(mod)}
                  className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                    activeModule === mod
                      ? "border-brand-600 text-brand-600"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {MODULE_LABELS[mod]}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
