"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  getCollectionQueue,
  getLoanPayments,
  recordPayment,
  type LoanPayment,
  type OpsLoan,
} from "@/lib/api";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function CollectionModule() {
  const [loans, setLoans] = useState<OpsLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [utrNumber, setUtrNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCollectionQueue();
      setLoans(data.loans);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Failed to load collection queue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPayments = useCallback(async (loanId: string) => {
    try {
      const data = await getLoanPayments(loanId);
      setPayments(data.payments);
    } catch {
      setPayments([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedLoanId) {
      loadPayments(selectedLoanId);
    }
  }, [selectedLoanId, loadPayments]);

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);

  async function handlePayment(e: FormEvent) {
    e.preventDefault();
    if (!selectedLoanId || !selectedLoan) return;

    setSubmitting(true);
    setError("");
    try {
      await recordPayment({
        loanId: selectedLoanId,
        utrNumber,
        amount: Number(amount),
        paymentDate,
      });
      setUtrNumber("");
      setAmount("");
      await load();
      await loadPayments(selectedLoanId);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Payment failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading active loans...</p>;

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Collection — Record payments</h2>
      <p className="mt-1 text-sm text-slate-600">
        UTR must be unique. Loan auto-closes when outstanding reaches zero.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-slate-700">Disbursed loans</h3>
          {loans.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No active loans.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {loans.map((loan) => (
                <li key={loan.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedLoanId(loan.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                      selectedLoanId === loan.id
                        ? "border-brand-600 bg-brand-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="font-medium text-slate-900">
                      {loan.borrower.fullName || loan.borrower.email}
                    </p>
                    <p className="text-xs text-slate-600">
                      Outstanding {formatCurrency(loan.outstandingAmount)} /{" "}
                      {formatCurrency(loan.totalRepaymentAmount)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {!selectedLoan ? (
            <p className="text-sm text-slate-500">Select a loan to record a payment.</p>
          ) : (
            <>
              <p className="font-medium text-slate-900">{selectedLoan.borrower.email}</p>
              <p className="mt-1 text-sm text-slate-600">
                Outstanding: {formatCurrency(selectedLoan.outstandingAmount)}
              </p>

              <form onSubmit={handlePayment} className="mt-4 space-y-3">
                <label className="block text-xs font-medium text-slate-700">
                  UTR number
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
                    required
                  />
                </label>
                <label className="block text-xs font-medium text-slate-700">
                  Amount (max {formatCurrency(selectedLoan.outstandingAmount)})
                  <input
                    type="number"
                    min={0.01}
                    max={selectedLoan.outstandingAmount}
                    step={0.01}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </label>
                <label className="block text-xs font-medium text-slate-700">
                  Payment date
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? "Recording..." : "Record payment"}
                </button>
              </form>

              {payments.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-medium uppercase text-slate-500">Payment history</h4>
                  <ul className="mt-2 space-y-2 text-sm">
                    {payments.map((p) => (
                      <li key={p.id} className="flex justify-between text-slate-700">
                        <span>
                          {p.utrNumber} · {new Date(p.paymentDate).toLocaleDateString()}
                        </span>
                        <span>{formatCurrency(p.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
