"use client";

import { useState, useMemo } from "react";

const RATE = 12;
const MIN_AMOUNT = 50_000;
const MAX_AMOUNT = 5_00_000;
const MIN_TENURE = 30;
const MAX_TENURE = 365;

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function calcLoan(principal: number, tenureDays: number) {
  const si = (principal * RATE * tenureDays) / (365 * 100);
  const total = principal + si;
  const daily = total / tenureDays;
  return { si, total, daily };
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  accent?: string;
}

function Slider({ label, value, min, max, step, format, onChange, accent = "#00baf2" }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280]">{label}</span>
        <span
          className="rounded-md px-2.5 py-0.5 text-xs font-bold"
          style={{ background: `${accent}18`, color: accent }}
        >
          {format(value)}
        </span>
      </div>

      <div className="relative h-1.5 w-full rounded-full bg-[#e5e7eb]">
        <div
          className="absolute left-0 top-0 h-1.5 rounded-full transition-all duration-150"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #00baf2, #0070ba)` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ zIndex: 2 }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-all duration-150"
          style={{ left: `calc(${pct}% - 8px)`, background: accent }}
        />
      </div>

      <div className="mt-1 flex justify-between text-[10px] text-[#9ca3af]">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export function LoanCalculator() {
  const [amount, setAmount] = useState(2_00_000);
  const [tenure, setTenure] = useState(180);

  const { si, total, daily } = useMemo(() => calcLoan(amount, tenure), [amount, tenure]);

  const breakdown = [
    { label: "Loan Amount",       value: formatINR(amount),          color: "#0a1930" },
    { label: "Interest Rate",     value: `${RATE}% p.a.`,            color: "#00baf2" },
    { label: "Tenure",            value: `${tenure} days`,            color: "#0070ba" },
    { label: "Total Interest",    value: formatINR(si),               color: "#f97316" },
    { label: "Total Repayment",   value: formatINR(total),            color: "#00baf2", bold: true },
    { label: "Daily Repayment",   value: `${formatINR(daily)}/day`,   color: "#10b981", bold: true },
  ];

  return (
    <div className="flex flex-col items-start py-8 lg:py-12 w-full">

      {/* Badge */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00baf2] shadow-md">
          <span className="text-lg font-bold text-white">₹</span>
        </div>
        <div className="leading-snug">
          <p className="text-xl font-bold text-[#0a1930]">Personal</p>
          <p className="text-xl font-bold text-[#0a1930]">Loan</p>
        </div>
      </div>

      {/* Headline */}
      <h1 className="mb-5 text-[2.2rem] font-extrabold leading-[1.1] tracking-tight text-[#0a1930] sm:text-4xl lg:text-[2.6rem]">
        Personal Loan
        <br />
        <span>- Instant in </span>
        <span className="text-[#00baf2]">2 Minutes</span>
      </h1>

      {/* Calculator card */}
      <div className="w-full max-w-[440px] rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-xl">

        {/* Card header */}
        <div className="mb-4 flex items-center gap-2 border-b border-[#f3f4f6] pb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-[#00baf2]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#6b7280]">
            EMI Calculator
          </span>
          <span className="ml-auto rounded-full bg-[#00baf2]/10 px-2 py-0.5 text-[10px] font-bold text-[#00baf2]">
            12% p.a. Fixed
          </span>
        </div>

        {/* Sliders */}
        <Slider
          label="Loan Amount"
          value={amount}
          min={MIN_AMOUNT}
          max={MAX_AMOUNT}
          step={5000}
          format={(v) => `₹${(v / 1000).toFixed(0)}K`}
          onChange={setAmount}
          accent="#00baf2"
        />
        <Slider
          label="Tenure"
          value={tenure}
          min={MIN_TENURE}
          max={MAX_TENURE}
          step={5}
          format={(v) => `${v} days`}
          onChange={setTenure}
          accent="#0070ba"
        />

        {/* Breakdown grid */}
        <div className="mt-1 grid grid-cols-2 gap-2">
          {breakdown.map(({ label, value, color, bold }) => (
            <div
              key={label}
              className="rounded-xl border border-[#f3f4f6] bg-[#f9fafb] px-3 py-2.5"
            >
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                {label}
              </p>
              <p
                className={bold ? "text-sm font-black" : "text-xs font-bold"}
                style={{ color }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Formula note */}
        <p className="mt-3 rounded-lg bg-[#f0f9ff] px-3 py-1.5 text-center text-[10px] text-[#6b7280]">
          SI = (P × R × T) / (365 × 100) &nbsp;•&nbsp; Simple Interest
        </p>
      </div>

      {/* Partner note */}
      <p className="mt-4 text-[10px] text-[#9ca3af]">
        Loan facility is provided by our Lending partners. Interest rate fixed at 12% p.a.
      </p>
    </div>
  );
}