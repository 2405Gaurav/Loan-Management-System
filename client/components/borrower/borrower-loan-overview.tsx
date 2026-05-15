"use client";

import { motion } from "framer-motion";
import type { LoanApplication } from "@/lib/api";
import { formatINR } from "@/lib/loan-calculations";
import { getLoanStatusHeadline, getLoanStatusMessage } from "@/lib/loan-status";
import { LoanLifecycleTimeline } from "@/components/borrower/loan-lifecycle-timeline";
import { LoanPaymentHistory } from "@/components/borrower/loan-payment-history";

type Props = {
  loan: LoanApplication;
};

const statusBadgeStyles: Record<string, string> = {
  APPLIED: "bg-sky-100 text-sky-800",
  SANCTIONED: "bg-violet-100 text-violet-800",
  DISBURSED: "bg-[#00baf2]/15 text-[#0095c8]",
  CLOSED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

const alertStyles: Record<string, string> = {
  APPLIED: "border-amber-200 bg-amber-50 text-amber-900",
  SANCTIONED: "border-violet-200 bg-violet-50 text-violet-900",
  DISBURSED: "border-[#00baf2]/30 bg-[#00baf2]/5 text-[#0a1930]",
  CLOSED: "border-emerald-200 bg-emerald-50 text-emerald-900",
  REJECTED: "border-red-200 bg-red-50 text-red-900",
};

export function BorrowerLoanOverview({ loan }: Props) {
  const headline = getLoanStatusHeadline(loan);
  const message = getLoanStatusMessage(loan);
  const paid = loan.totalPaidAmount ?? 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0a1930]">Your loan</h2>
            <p className="mt-1 text-sm text-slate-600">{headline}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              statusBadgeStyles[loan.status] ?? "bg-slate-100 text-slate-700"
            }`}
          >
            {loan.status}
          </span>
        </div>

        <p
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            alertStyles[loan.status] ?? "border-slate-200 bg-slate-50"
          }`}
        >
          {message}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Principal", value: formatINR(loan.principalAmount) },
            { label: "Total repayment", value: formatINR(loan.totalRepaymentAmount) },
            { label: "Amount repaid", value: formatINR(paid) },
            { label: "Outstanding", value: formatINR(loan.outstandingAmount) },
            { label: "Tenure", value: `${loan.tenureInDays} days` },
            { label: "Interest (SI)", value: formatINR(loan.simpleInterest) },
            { label: "Applied on", value: new Date(loan.appliedAt).toLocaleString("en-IN") },
            { label: "Application ID", value: loan.id.slice(-8).toUpperCase() },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {row.label}
              </p>
              <p className="mt-1 text-sm font-bold text-[#0a1930]">{row.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LoanLifecycleTimeline loan={loan} />
        <LoanPaymentHistory loan={loan} />
      </div>
    </div>
  );
}
