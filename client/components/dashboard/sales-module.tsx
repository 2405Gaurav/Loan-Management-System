"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { SalesLeadTimeline } from "@/components/dashboard/sales-lead-timeline";
import { getSalesLeads, type SalesLead } from "@/lib/api";

function currentStageLabel(lead: SalesLead): string {
  const current = lead.timeline.find((s) => s.state === "current" || s.state === "failed");
  return current?.label ?? "Registered";
}

export function SalesModule() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSalesLeads();
      setLeads(data.leads);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Failed to load leads";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-slate-500">Loading leads...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Sales — Lead tracking</h2>
      <p className="mt-1 text-sm text-slate-600">
        Pre-application borrowers: registration → BRE → salary slip → loan apply. Expand a lead
        for the full timeline and BRE attempt history.
      </p>

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
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {lead.fullName || "No name yet"}
                    </p>
                    <p className="text-xs text-slate-500">{lead.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
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
                  <div className="border-t border-slate-100 px-5 pb-5">
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
