"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { LiveSyncBadge } from "@/components/dashboard/live-sync-badge";
import { SalesLeadTimeline } from "@/components/dashboard/sales-lead-timeline";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import { getSalesLeads, type SalesLead } from "@/lib/api";

function currentStageLabel(lead: SalesLead): string {
  const current = lead.timeline.find((s) => s.state === "current" || s.state === "failed");
  return current?.label ?? "Registered";
}

export function SalesModule() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    else setSyncing(true);
    if (!opts?.silent) setError("");
    try {
      const data = await getSalesLeads();
      setLeads(data.leads);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (!opts?.silent) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : "Failed to load leads";
        setError(message);
      }
    } finally {
      if (!opts?.silent) setLoading(false);
      else setSyncing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useLiveRefresh(() => load({ silent: true }));

  if (loading) return <p className="text-sm text-slate-500">Loading leads...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sales — Lead tracking</h2>
          <p className="mt-1 text-sm text-slate-600">
            Pre-application borrowers: registration → BRE → salary slip → loan apply. Expand a
            lead for the full timeline and BRE attempt history.
          </p>
        </div>
        <LiveSyncBadge lastUpdated={lastUpdated} syncing={syncing} />
      </div>

      {leads.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No leads at the moment.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {leads.map((lead) => {
            const isOpen = expandedId === lead.id;
            return (
              <li
                key={lead.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : lead.id)}
                  className="flex w-full flex-col gap-3 px-4 py-4 text-left hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {lead.fullName || "No name yet"}
                    </p>
                    <p className="truncate text-xs text-slate-500">{lead.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-600">
                      {currentStageLabel(lead)}
                    </span>
                    <span
                      className={`text-xs ${isOpen ? "text-brand-600" : "text-slate-400"}`}
                    >
                      {isOpen ? "Hide timeline" : "View timeline"}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-5 sm:px-5">
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-wide">
                      <span
                        className={`rounded px-2 py-0.5 ${
                          lead.brePassed
                            ? "bg-emerald-100 text-emerald-800"
                            : lead.breHistory.length > 0
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        BRE:{" "}
                        {lead.brePassed
                          ? "Passed"
                          : lead.breHistory.length > 0
                            ? "Failed"
                            : "Not started"}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 ${
                          lead.salarySlipUploaded
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        Slip: {lead.salarySlipUploaded ? "Uploaded" : "Pending"}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                        Loan: {lead.latestLoanStatus ?? "Not applied"}
                      </span>
                    </div>
                    <SalesLeadTimeline steps={lead.timeline} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
