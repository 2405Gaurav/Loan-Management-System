"use client";

import { motion } from "framer-motion";
import type { LoanApplication } from "@/lib/api";
import { buildLoanTimeline, type TimelineStepState } from "@/lib/loan-status";

type Props = {
  loan: LoanApplication;
};

const stateStyles: Record<
  TimelineStepState,
  { dot: string; line: string; label: string }
> = {
  done: {
    dot: "bg-emerald-500 border-emerald-500 text-white",
    line: "bg-emerald-200",
    label: "text-slate-900",
  },
  current: {
    dot: "bg-brand-500 border-brand-500 text-white ring-4 ring-brand-100",
    line: "bg-brand-200",
    label: "text-brand-700 font-semibold",
  },
  upcoming: {
    dot: "bg-white border-slate-300 text-slate-400",
    line: "bg-slate-200",
    label: "text-slate-500",
  },
  rejected: {
    dot: "bg-red-500 border-red-500 text-white",
    line: "bg-red-200",
    label: "text-red-700",
  },
};

export function LoanLifecycleTimeline({ loan }: Props) {
  const steps = buildLoanTimeline(loan);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-slate-900">Loan journey</h3>
      <p className="mt-1 text-xs text-slate-500">
        Live status synced with sales, sanction, disbursement &amp; collection teams
      </p>

      <ol className="mt-6 space-y-0">
        {steps.map((step, index) => {
          const styles = stateStyles[step.state];
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 ${styles.line}`}
                  aria-hidden
                />
              )}

              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.08 }}
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${styles.dot}`}
              >
                {step.state === "done" ? "✓" : step.state === "rejected" ? "✕" : index + 1}
              </motion.span>

              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="min-w-0 flex-1 pt-0.5"
              >
                <p className={`text-sm ${styles.label}`}>{step.label}</p>
                <p className="text-xs text-slate-500">{step.description}</p>
                {step.date && (
                  <p className="mt-1 text-[11px] text-slate-400">{step.date}</p>
                )}
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
