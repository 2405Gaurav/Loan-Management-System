"use client";

import { motion } from "framer-motion";
import type { LoanApplication } from "@/lib/api";
import { formatINR } from "@/lib/loan-calculations";

type Props = {
  loan: LoanApplication;
};

export function LoanSummaryCard({ loan }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#0a1930]">Loan application summary</h2>
          <p className="mt-1 text-sm text-slate-500">
            Submitted successfully — awaiting team review
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#00baf2]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#00baf2]">
            {loan.status}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
            {loan.approvalStatus ?? "PENDING"}
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      >
        Your application is <strong>Applied</strong> and <strong>Pending</strong> approval.
        Sanction / Disbursement teams can review it in the admin queue.
      </motion.div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { label: "Loan Amount (P)", value: formatINR(loan.principalAmount) },
          { label: "Tenure (T)", value: `${loan.tenureInDays} days` },
          { label: "Interest Rate (R)", value: `${loan.interestRate}% p.a.` },
          { label: "Simple Interest (SI)", value: formatINR(loan.simpleInterest) },
          { label: "Total Repayment", value: formatINR(loan.totalRepaymentAmount) },
          { label: "Outstanding", value: formatINR(loan.outstandingAmount) },
          { label: "Applied On", value: new Date(loan.appliedAt).toLocaleString("en-IN") },
          { label: "Application ID", value: loan.id.slice(-8).toUpperCase() },
        ].map((row, index) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {row.label}
            </p>
            <p className="mt-1 text-sm font-bold text-[#0a1930]">{row.value}</p>
          </motion.div>
        ))}
      </div>

      {loan.salarySlipDocument && (
        <p className="mt-4 text-xs text-slate-500">
          Salary slip: {loan.salarySlipDocument.originalFileName}
        </p>
      )}
    </motion.div>
  );
}
