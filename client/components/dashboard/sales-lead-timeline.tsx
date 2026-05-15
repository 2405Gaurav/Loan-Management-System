"use client";

import type { SalesLeadTimelineStep } from "@/lib/api";

const stateStyles: Record<
  SalesLeadTimelineStep["state"],
  { dot: string; label: string }
> = {
  done: { dot: "bg-emerald-500 border-emerald-500 text-white", label: "text-slate-900" },
  current: {
    dot: "bg-brand-500 border-brand-500 text-white ring-4 ring-brand-100",
    label: "text-brand-700 font-medium",
  },
  upcoming: { dot: "bg-white border-slate-300 text-slate-400", label: "text-slate-500" },
  failed: { dot: "bg-red-500 border-red-500 text-white", label: "text-red-700" },
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  steps: SalesLeadTimelineStep[];
};

export function SalesLeadTimeline({ steps }: Props) {
  return (
    <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Lead journey
      </p>
      <ol className="mt-4 space-y-0">
        {steps.map((step, index) => {
          const styles = stateStyles[step.state];
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className="absolute left-[9px] top-5 h-[calc(100%-8px)] w-0.5 bg-slate-200"
                  aria-hidden
                />
              )}
              <span
                className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold ${styles.dot}`}
              >
                {step.state === "done" ? "✓" : step.state === "failed" ? "!" : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${styles.label}`}>{step.label}</p>
                <p className="text-xs text-slate-600">{step.detail}</p>
                {step.date && (
                  <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(step.date)}</p>
                )}

                {step.breAttempts && step.breAttempts.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {step.breAttempts.map((attempt, i) => (
                      <li
                        key={`${step.id}-bre-${i}`}
                        className={`rounded-md border px-3 py-2 text-xs ${
                          attempt.passed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-red-200 bg-red-50 text-red-900"
                        }`}
                      >
                        <p className="font-semibold">
                          Attempt {i + 1} — {attempt.passed ? "Passed" : "Failed"}
                          <span className="ml-2 font-normal text-slate-500">
                            {formatDate(attempt.attemptedAt)}
                          </span>
                        </p>
                        {!attempt.passed && attempt.failureReasons.length > 0 && (
                          <ul className="mt-1 list-inside list-disc text-red-800">
                            {attempt.failureReasons.map((err) => (
                              <li key={err}>{err}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
