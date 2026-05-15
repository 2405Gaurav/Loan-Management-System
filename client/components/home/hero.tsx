"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { useFirstSession } from "@/hooks/use-first-session";
import { ROUTES } from "@/lib/navigation";

const HERO_SEEN_KEY = "hero-entered";
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease },
  },
};

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
  return { si, total, daily: total / tenureDays };
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

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  accent = "#2563eb",
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <span
          className="rounded-lg px-3 py-1 text-sm font-bold"
          style={{ background: `${accent}18`, color: accent }}
        >
          {format(value)}
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-slate-200">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 z-[2] h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-[3px] border-white bg-brand-600 shadow-md transition-all duration-150"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export function Hero() {
  const launch = useFirstSession(HERO_SEEN_KEY);
  const [amount, setAmount] = useState(2_00_000);
  const [tenure, setTenure] = useState(180);

  const { si, total, daily } = useMemo(() => calcLoan(amount, tenure), [amount, tenure]);

  const breakdown = [
    { label: "Loan Amount", value: formatINR(amount), color: "#0f172a" },
    { label: "Interest Rate", value: `${RATE}% p.a.`, color: "#2563eb" },
    { label: "Tenure", value: `${tenure} days`, color: "#1d4ed8" },
    { label: "Total Interest", value: formatINR(si), color: "#ea580c" },
    { label: "Total Repayment", value: formatINR(total), color: "#2563eb", bold: true },
    { label: "Daily Repayment", value: `${formatINR(daily)}/day`, color: "#059669", bold: true },
  ];

  if (launch === "pending") {
    return <section className="min-h-[680px] bg-white" aria-busy="true" aria-label="Loading" />;
  }

  const playIntro = launch === "first";

  return (
    <section className="relative w-full overflow-hidden bg-white font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          className="grid min-h-[680px] grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-0"
          variants={container}
          initial={playIntro ? "hidden" : false}
          animate={playIntro ? "visible" : false}
        >
          <div className="flex flex-col items-start py-10 lg:py-14">
            <motion.div variants={fadeUp}>
              <h1 className="mb-6 text-[2.75rem] font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.2rem]">
                Loan Management
                <br />
                <span className="text-brand-600">System</span>
              </h1>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-8 flex flex-wrap gap-3">
              <ButtonLink href={ROUTES.signup} variant="blue" className="!rounded-full">
                Get started
              </ButtonLink>
              <ButtonLink href={ROUTES.login} variant="outline" className="!rounded-full">
                Sign in
              </ButtonLink>
            </motion.div>

            <motion.div variants={fadeUp} className="w-full max-w-[480px]">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <div className="h-2 w-2 rounded-full bg-brand-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    EMI Calculator
                  </span>
                  <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-600">
                    12% p.a. Fixed
                  </span>
                </div>

                <Slider
                  label="Loan Amount"
                  value={amount}
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step={5000}
                  format={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  onChange={setAmount}
                />
                <Slider
                  label="Tenure"
                  value={tenure}
                  min={MIN_TENURE}
                  max={MAX_TENURE}
                  step={5}
                  format={(v) => `${v} days`}
                  onChange={setTenure}
                  accent="#1d4ed8"
                />

                <div className="mt-2 grid grid-cols-2 gap-3">
                  {breakdown.map(({ label, value, color, bold }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {label}
                      </p>
                      <p
                        className={bold ? "text-base font-black" : "text-sm font-bold"}
                        style={{ color }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-center text-[10px] text-slate-500">
                  SI = (P × R × T) / (365 × 100) · Simple Interest
                </p>
              </div>

              <p className="mt-5 text-[11px] text-slate-400">
                Loan facility is provided by our Lending partners. Interest rate fixed at 12% p.a.
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={fadeInRight}
            className="relative flex h-[420px] w-full items-start justify-center lg:h-[680px] lg:justify-end"
          >
            <div className="relative mt-8 h-full w-full lg:mt-16">
              <Image
                src="/hero1.png"
                alt="Personal loan illustration"
                fill
                priority
                className="object-contain object-top lg:object-right-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
