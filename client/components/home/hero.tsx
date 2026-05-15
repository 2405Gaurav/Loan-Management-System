"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

// ── Loan Math (Assignment Spec) ───────────────────────────────
// SI = (P × R × T) / (365 × 100)  |  R = 12% p.a.  |  T = days
// Total Repayment = P + SI
// Daily Repayment = Total / T
// ─────────────────────────────────────────────────────────────

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

// ── Slider ────────────────────────────────────────────────────
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
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">{label}</span>
        <span
          className="rounded-lg px-3 py-1 text-sm font-bold"
          style={{ background: `${accent}18`, color: accent }}
        >
          {format(value)}
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-[#e5e7eb]">
        <div
          className="absolute left-0 top-0 h-2 rounded-full transition-all duration-150"
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
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md transition-all duration-150"
          style={{ left: `calc(${pct}% - 10px)`, background: accent }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-[#9ca3af]">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────
export function Hero() {
  const [amount, setAmount] = useState(2_00_000);
  const [tenure, setTenure] = useState(180);

  const { si, total, daily } = useMemo(() => calcLoan(amount, tenure), [amount, tenure]);

  const breakdown = [
    { label: "Loan Amount",      value: formatINR(amount),          color: "#0a1930" },
    { label: "Interest Rate",    value: `${RATE}% p.a.`,            color: "#00baf2" },
    { label: "Tenure",           value: `${tenure} days`,            color: "#0070ba" },
    { label: "Total Interest",   value: formatINR(si),               color: "#f97316" },
    { label: "Total Repayment",  value: formatINR(total),            color: "#00baf2", bold: true },
    { label: "Daily Repayment",  value: `${formatINR(daily)}/day`,   color: "#10b981", bold: true },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid min-h-[680px] grid-cols-1 items-start gap-0 lg:grid-cols-2">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col items-start py-10 lg:py-14">

          

            {/* Main Headline */}
            <h1 className="mb-6 text-[2.75rem] font-extrabold leading-[1.1] tracking-tight text-[#0a1930] sm:text-5xl lg:text-[3.2rem]">
              Personal Loan
              <br />
              <span>- Instant in </span>
              <span className="text-[#00baf2]">2 Minutes</span>
            </h1>

            {/* ── Calculator Card ── */}
            <div className="w-full max-w-[480px] rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-xl">

              {/* Card header */}
              <div className="mb-5 flex items-center gap-2 border-b border-[#f3f4f6] pb-4">
                <div className="h-2 w-2 rounded-full bg-[#00baf2]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">
                  EMI Calculator
                </span>
                <span className="ml-auto rounded-full bg-[#00baf2]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#00baf2]">
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
              <div className="mt-2 grid grid-cols-2 gap-3">
                {breakdown.map(({ label, value, color, bold }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[#f3f4f6] bg-[#f9fafb] px-4 py-3"
                  >
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                      {label}
                    </p>
                    <p
                      className={`${bold ? "text-base font-black" : "text-sm font-bold"}`}
                      style={{ color }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Formula note */}
              <p className="mt-4 rounded-lg bg-[#f0f9ff] px-3 py-2 text-center text-[10px] text-[#6b7280]">
                SI = (P × R × T) / (365 × 100) &nbsp;•&nbsp; Simple Interest
              </p>
            </div>

            {/* Partner note */}
            <p className="mt-5 text-[11px] text-[#9ca3af]">
              Loan facility is provided by our Lending partners. Interest rate fixed at 12% p.a.
            </p>
          </div>

          {/* ── RIGHT COLUMN — Hero image (untouched) ── */}
          <div className="relative flex h-[420px] w-full items-start justify-center lg:h-[680px] lg:justify-end">
            <div className="relative h-full w-full mt-19">
              <Image
                src="/hero1.png"
                alt="Personal Loan – Instant in 2 Minutes"
                fill
                priority
                className="object-contain object-top lg:object-right-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}