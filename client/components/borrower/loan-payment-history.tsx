"use client";

import { motion } from "framer-motion";
import type { LoanApplication } from "@/lib/api";
import { formatINR } from "@/lib/loan-calculations";
import { getRepaymentProgress } from "@/lib/loan-status";

type Props = {
  loan: LoanApplication;
};

export function LoanPaymentHistory({ loan }: Props) {
  const payments = loan.payments ?? [];
  const { total, paid, outstanding, percent } = getRepaymentProgress(loan);

  const showSection =
    loan.status === "DISBURSED" ||
    loan.status === "CLOSED" ||
    payments.length > 0;

  if (!showSection) {
    return (
      <motion.div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Repayment history will appear here after your loan is disbursed and the collection
        team records payments.
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-slate-900">Repayments &amp; collections</h3>
      <p className="mt-1 text-xs text-slate-500">
        Payments recorded by the collection team against your loan
      </p>

      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <span>Total repaid</span>
          <span>Total due</span>
        </div>
        <div className="mt-2 flex justify-between text-sm font-bold text-slate-900">
          <span>{formatINR(paid)}</span>
          <span>{formatINR(total)}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full bg-emerald-500"
          />
        </div>
        <p className="mt-2 text-xs text-slate-600">
          <span className="font-semibold text-emerald-700">{percent}%</span> repaid ·{" "}
          <span className="font-semibold text-amber-800">
            Outstanding {formatINR(outstanding)}
          </span>
        </p>
      </div>

      {payments.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No payments recorded yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-4 font-semibold">#</th>
                <th className="pb-2 pr-4 font-semibold">UTR</th>
                <th className="pb-2 pr-4 font-semibold">Amount</th>
                <th className="pb-2 pr-4 font-semibold">Date</th>
                <th className="pb-2 pr-4 font-semibold">Balance after</th>
                <th className="pb-2 font-semibold">Recorded by</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                  <td className="py-3 pr-4 font-mono text-xs font-medium text-slate-800">
                    {p.utrNumber}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-emerald-700">
                    −{formatINR(p.amount)}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 pr-4 text-slate-700">
                    {formatINR(p.remainingBalanceAfterPayment)}
                  </td>
                  <td className="py-3 text-xs text-slate-500">{p.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
