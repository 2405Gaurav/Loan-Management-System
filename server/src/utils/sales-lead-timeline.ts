import { LoanStatus } from "../models/enums.js";
import type { IBreHistoryEntry } from "../models/user.model.js";

export type LeadStepState = "done" | "current" | "upcoming" | "failed";

export interface SalesLeadTimelineStep {
  id: string;
  label: string;
  state: LeadStepState;
  detail: string;
  date: string | null;
  breAttempts?: Array<{
    passed: boolean;
    failureReasons: string[];
    attemptedAt: string;
  }>;
}

export function buildSalesLeadTimeline(input: {
  registeredAt: Date;
  breHistory: IBreHistoryEntry[];
  brePassed: boolean;
  salarySlipUploaded: boolean;
  latestLoanStatus: LoanStatus | null;
  latestLoanAppliedAt: Date | null;
}): SalesLeadTimelineStep[] {
  const formatAttempts = (history: IBreHistoryEntry[]) =>
    history.map((h) => ({
      passed: h.passed,
      failureReasons: h.failureReasons ?? [],
      attemptedAt: h.attemptedAt.toISOString(),
    }));

  const registered: SalesLeadTimelineStep = {
    id: "registered",
    label: "Registered",
    state: "done",
    detail: "Account created on platform",
    date: input.registeredAt.toISOString(),
  };

  let breStep: SalesLeadTimelineStep;
  if (input.breHistory.length === 0) {
    breStep = {
      id: "bre",
      label: "Eligibility check (BRE)",
      state: "current",
      detail: "Personal details not submitted — BRE not run yet",
      date: null,
    };
  } else if (input.brePassed) {
    breStep = {
      id: "bre",
      label: "Eligibility check (BRE)",
      state: "done",
      detail: `Passed (${input.breHistory.length} attempt${input.breHistory.length > 1 ? "s" : ""})`,
      date: input.breHistory[input.breHistory.length - 1].attemptedAt.toISOString(),
      breAttempts: formatAttempts(input.breHistory),
    };
  } else {
    breStep = {
      id: "bre",
      label: "Eligibility check (BRE)",
      state: "failed",
      detail: `Failed — ${input.breHistory.length} attempt(s), not eligible yet`,
      date: input.breHistory[input.breHistory.length - 1].attemptedAt.toISOString(),
      breAttempts: formatAttempts(input.breHistory),
    };
  }

  let salaryStep: SalesLeadTimelineStep;
  if (!input.brePassed) {
    salaryStep = {
      id: "salary-slip",
      label: "Salary slip upload",
      state: "upcoming",
      detail: input.breHistory.length === 0 ? "Waiting for BRE" : "Blocked until BRE passes",
      date: null,
    };
  } else if (input.salarySlipUploaded) {
    salaryStep = {
      id: "salary-slip",
      label: "Salary slip upload",
      state: "done",
      detail: "Document uploaded",
      date: null,
    };
  } else {
    salaryStep = {
      id: "salary-slip",
      label: "Salary slip upload",
      state: "current",
      detail: "BRE passed — awaiting salary slip",
      date: null,
    };
  }

  let loanStep: SalesLeadTimelineStep;
  if (!input.brePassed || !input.salarySlipUploaded) {
    loanStep = {
      id: "loan-apply",
      label: "Loan application",
      state: "upcoming",
      detail: "Complete BRE and salary slip first",
      date: null,
    };
  } else if (!input.latestLoanStatus) {
    loanStep = {
      id: "loan-apply",
      label: "Loan application",
      state: "current",
      detail: "Ready to apply — not submitted yet",
      date: null,
    };
  } else if (input.latestLoanStatus === LoanStatus.REJECTED) {
    loanStep = {
      id: "loan-apply",
      label: "Loan application",
      state: "failed",
      detail: "Application submitted but rejected at sanction",
      date: input.latestLoanAppliedAt?.toISOString() ?? null,
    };
  } else {
    loanStep = {
      id: "loan-apply",
      label: "Loan application",
      state: "done",
      detail: `Application submitted (${input.latestLoanStatus})`,
      date: input.latestLoanAppliedAt?.toISOString() ?? null,
    };
  }

  return [registered, breStep, salaryStep, loanStep];
}
