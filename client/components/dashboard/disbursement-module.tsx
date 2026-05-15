"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
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
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDisbursementQueue();
      setLoans(data.loans);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Failed to load disbursement queue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDisburse(loanId: string) {
    setActionLoading(loanId);
    try {
      await disburseLoan(loanId);
      await load();
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
      <h2 className="text-lg font-semibold text-slate-900">Disbursement — Release funds</h2>
      <p className="mt-1 text-sm text-slate-600">
        Mark sanctioned loans as disbursed (status becomes DISBURSED).
      </p>

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
