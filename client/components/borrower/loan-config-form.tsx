"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { LoanLiveCalculation } from "@/components/borrower/loan-live-calculation";
import { Alert } from "@/components/auth-form";
import { applyForLoan, type LoanApplication } from "@/lib/api";
import {
  calculateLoanTotals,
  formatINR,
  LOAN_MAX_AMOUNT,
  LOAN_MAX_TENURE,
  LOAN_MIN_AMOUNT,
  LOAN_MIN_TENURE,
} from "@/lib/loan-calculations";

type Props = {
  onApplied: (loan: LoanApplication) => void;
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <motion.div layout className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <motion.span
          key={value}
          initial={{ scale: 0.95, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-lg bg-[#00baf2]/10 px-3 py-1 text-sm font-bold text-[#00baf2]"
        >
          {format(value)}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200"
        style={{
          background: `linear-gradient(to right, #00baf2 0%, #00baf2 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
        }}
      />
      <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </motion.div>
  );
}

export function LoanConfigForm({ onApplied }: Props) {
  const [principal, setPrincipal] = useState(200_000);
  const [tenure, setTenure] = useState(180);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const totals = useMemo(
    () => calculateLoanTotals(principal, tenure),
    [principal, tenure]
  );

  async function handleApply() {
    setError("");
    setLoading(true);

    try {
      const result = await applyForLoan({
        principalAmount: principal,
        tenureInDays: tenure,
      });
      onApplied(result.loan);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Failed to submit loan application";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-lg font-bold text-[#0a1930]">Step 4 — Configure Loan & Apply</h2>
      <p className="mt-1 text-sm text-slate-500">
        Loan amount ₹50,000 – ₹5,00,000 · Tenure 30 – 365 days · Fixed 12% p.a. simple interest
      </p>

      <div className="mt-8">
        <Slider
          label="Loan Amount"
          value={principal}
          min={LOAN_MIN_AMOUNT}
          max={LOAN_MAX_AMOUNT}
          step={5000}
          format={(v) => formatINR(v)}
          onChange={setPrincipal}
        />
        <Slider
          label="Tenure"
          value={tenure}
          min={LOAN_MIN_TENURE}
          max={LOAN_MAX_TENURE}
          step={5}
          format={(v) => `${v} days`}
          onChange={setTenure}
        />
      </div>

      <LoanLiveCalculation
        principal={principal}
        tenureInDays={tenure}
        simpleInterest={totals.simpleInterest}
        totalRepayment={totals.totalRepaymentAmount}
        interestRate={totals.interestRate}
      />

      {error && (
        <div className="mt-4">
          <Alert type="error" message={error} />
        </div>
      )}

      <motion.button
        type="button"
        onClick={handleApply}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.99 }}
        className="mt-6 w-full rounded-full bg-[#00baf2] px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#0099d6] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Submitting application..." : "Apply"}
      </motion.button>

      <p className="mt-3 text-center text-xs text-slate-500">
        On apply, your loan will be saved as <strong>APPLIED</strong> with approval status{" "}
        <strong>PENDING</strong> for review by our team.
      </p>
    </motion.div>
  );
}
