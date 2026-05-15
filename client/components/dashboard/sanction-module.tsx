"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { LiveSyncBadge } from "@/components/dashboard/live-sync-badge";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import {
  approveLoan,
  getSanctionQueue,
  rejectLoan,
  type OpsLoan,
} from "@/lib/api";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function SanctionModule() {
  const [loans, setLoans] = useState<OpsLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    else setSyncing(true);
    if (!opts?.silent) setError("");
    try {
      const data = await getSanctionQueue();
      setLoans(data.loans);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (!opts?.silent) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : "Failed to load sanction queue";
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

  async function handleApprove(loanId: string) {
    setActionLoading(loanId);
    try {
      await approveLoan(loanId);
      await load({ silent: true });
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Approve failed";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(e: FormEvent, loanId: string) {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    setActionLoading(loanId);
    try {
      await rejectLoan(loanId, rejectReason.trim());
      setRejectingId(null);
      setRejectReason("");
      await load({ silent: true });
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Reject failed";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading applications...</p>;

  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sanction — Review applications</h2>
          <p className="mt-1 text-sm text-slate-600">
            Approve moves loan to SANCTIONED; reject requires a reason and sets REJECTED.
          </p>
        </div>
        <LiveSyncBadge lastUpdated={lastUpdated} syncing={syncing} />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loans.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No pending applications.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {loans.map((loan) => (
            <li
              key={loan.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {loan.borrower.fullName || loan.borrower.email}
                  </p>
                  <p className="text-xs text-slate-500">{loan.borrower.email}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {formatCurrency(loan.principalAmount)} · {loan.tenureInDays} days · Total{" "}
                    {formatCurrency(loan.totalRepaymentAmount)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Applied {new Date(loan.appliedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    disabled={actionLoading === loan.id}
                    onClick={() => handleApprove(loan.id)}
                    className="w-full rounded-full bg-brand-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50 sm:w-auto"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingId(loan.id);
                      setRejectReason("");
                    }}
                    className="w-full rounded-full border border-red-300 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 sm:w-auto"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {rejectingId === loan.id && (
                <form
                  onSubmit={(e) => handleReject(e, loan.id)}
                  className="mt-4 border-t border-slate-100 pt-4"
                >
                  <label className="block text-xs font-medium text-slate-700">
                    Rejection reason
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      rows={2}
                      required
                    />
                  </label>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={actionLoading === loan.id}
                      className="rounded-full bg-red-600 px-4 py-2 text-xs text-white disabled:opacity-50"
                    >
                      Confirm reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingId(null)}
                      className="text-xs text-slate-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
