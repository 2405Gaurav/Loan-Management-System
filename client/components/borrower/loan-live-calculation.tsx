"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatINR } from "@/lib/loan-calculations";

type Props = {
  principal: number;
  tenureInDays: number;
  simpleInterest: number;
  totalRepayment: number;
  interestRate: number;
};

function AnimatedValue({ value }: { value: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="text-sm font-bold text-[#0a1930]"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export function LoanLiveCalculation({
  principal,
  tenureInDays,
  simpleInterest,
  totalRepayment,
  interestRate,
}: Props) {
  const rows = [
    { label: "Principal (P)", value: formatINR(principal), highlight: false },
    { label: "Tenure (T)", value: `${tenureInDays} days`, highlight: false },
    { label: "Interest Rate (R)", value: `${interestRate}% p.a.`, highlight: false },
    { label: "Simple Interest (SI)", value: formatINR(simpleInterest), highlight: false },
    { label: "Total Repayment (P + SI)", value: formatINR(totalRepayment), highlight: true },
  ];

  return (
    <motion.div
      layout
      className="mt-6 rounded-xl border border-[#00baf2]/20 bg-gradient-to-br from-[#f0f9ff] to-white p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-[#00baf2]">
          Live calculation
        </p>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
          Updates as you slide
        </span>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <motion.div
            key={row.label}
            layout
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
              row.highlight
                ? "border border-[#00baf2]/30 bg-white shadow-sm"
                : "bg-white/60"
            }`}
          >
            <span className="text-xs font-medium text-slate-600">{row.label}</span>
            <AnimatedValue value={row.value} />
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-500">
        SI = (P × R × T) / (365 × 100) &nbsp;•&nbsp; Total Repayment = P + SI
      </p>
    </motion.div>
  );
}
