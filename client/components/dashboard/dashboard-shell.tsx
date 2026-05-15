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
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-sm font-semibold text-slate-900">Operations Dashboard</p>
          <p className="text-xs text-slate-500">Role: {role}</p>
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
