"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { LiveSyncBadge } from "@/components/dashboard/live-sync-badge";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import { disburseLoan, getDisbursementQueue, type OpsLoan } from "@/lib/api";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function DisbursementModule() {
  const [loans, setLoans] = useState<OpsLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    else setSyncing(true);
    if (!opts?.silent) setError("");
    try {
      const data = await getDisbursementQueue();
      setLoans(data.loans);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (!opts?.silent) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : "Failed to load disbursement queue";
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

  async function handleDisburse(loanId: string) {
    setActionLoading(loanId);
    try {
      await disburseLoan(loanId);
      await load({ silent: true });
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Disburse failed";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading sanctioned loans...</p>;

  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Disbursement — Release funds</h2>
          <p className="mt-1 text-sm text-slate-600">
            Mark sanctioned loans as disbursed (status becomes DISBURSED).
          </p>
        </div>
        <LiveSyncBadge lastUpdated={lastUpdated} syncing={syncing} />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loans.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No loans awaiting disbursement.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {loans.map((loan) => (
            <li
              key={loan.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {loan.borrower.fullName || loan.borrower.email}
                </p>
                <p className="text-sm text-slate-600">
                  {formatCurrency(loan.principalAmount)} · Total repay{" "}
                  {formatCurrency(loan.totalRepaymentAmount)}
                </p>
                {loan.sanctionedAt && (
                  <p className="text-xs text-slate-500">
                    Sanctioned {new Date(loan.sanctionedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={actionLoading === loan.id}
                onClick={() => handleDisburse(loan.id)}
                className="w-full shrink-0 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50 sm:w-auto"
              >
                Mark disbursed
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
