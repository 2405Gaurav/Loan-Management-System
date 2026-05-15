import type { LoanApplication, LoanStatus } from "./api";

export function getLoanStatusHeadline(loan: LoanApplication): string {
  switch (loan.status) {
    case "APPLIED":
      return loan.approvalStatus === "PENDING"
        ? "Application submitted — awaiting sanction review"
        : "Application under review";
    case "SANCTIONED":
      return "Loan sanctioned — awaiting disbursement";
    case "DISBURSED":
      return loan.outstandingAmount > 0
        ? "Loan disbursed — repayment in progress"
        : "Loan disbursed";
    case "CLOSED":
      return "Loan fully repaid and closed";
    case "REJECTED":
      return "Application rejected";
    default:
      return "Loan status";
  }
}

export function getLoanStatusMessage(loan: LoanApplication): string {
  switch (loan.status) {
    case "APPLIED":
      return "Your application is with the sanction team. You will be notified once it is approved or rejected.";
    case "SANCTIONED":
      return "Sanction approved your loan. The disbursement team will release funds shortly.";
    case "DISBURSED": {
      const paid = loan.totalPaidAmount ?? 0;
      if (paid > 0) {
        return `You have repaid ${paid.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}. Outstanding balance is updated after each payment recorded by collection.`;
      }
      return "Funds have been disbursed. Repayments will appear here when recorded by the collection team.";
    }
    case "CLOSED":
      return "Congratulations — all repayments are complete and your loan is closed.";
    case "REJECTED":
      return loan.rejectionReason
        ? `Reason: ${loan.rejectionReason}`
        : "Please contact support if you need more details.";
    default:
      return "";
  }
}

export type TimelineStepState = "done" | "current" | "upcoming" | "rejected";

export interface LoanTimelineStep {
  id: string;
  label: string;
  description: string;
  state: TimelineStepState;
  date: string | null;
}

const STATUS_ORDER: LoanStatus[] = ["APPLIED", "SANCTIONED", "DISBURSED", "CLOSED"];

function stepState(
  loanStatus: LoanStatus,
  stepStatus: LoanStatus,
  isRejected: boolean
): TimelineStepState {
  if (isRejected) {
    if (stepStatus === "APPLIED") return "done";
    if (stepStatus === "SANCTIONED") return "rejected";
    return "upcoming";
  }

  const loanIdx = STATUS_ORDER.indexOf(loanStatus);
  const stepIdx = STATUS_ORDER.indexOf(stepStatus);

  if (loanIdx > stepIdx) return "done";
  if (loanIdx === stepIdx) return loanStatus === "CLOSED" && stepStatus === "DISBURSED" ? "done" : "current";
  return "upcoming";
}

function formatStepDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildLoanTimeline(loan: LoanApplication): LoanTimelineStep[] {
  const isRejected = loan.status === "REJECTED";
  const paymentCount = loan.payments?.length ?? 0;

  const steps: LoanTimelineStep[] = [
    {
      id: "applied",
      label: "Applied",
      description: "Loan application submitted",
      state: stepState(loan.status, "APPLIED", isRejected),
      date: formatStepDate(loan.appliedAt),
    },
    {
      id: "sanctioned",
      label: "Sanctioned",
      description: isRejected ? "Application rejected" : "Approved by sanction team",
      state: isRejected ? "rejected" : stepState(loan.status, "SANCTIONED", false),
      date: formatStepDate(loan.sanctionedAt ?? undefined),
    },
    {
      id: "disbursed",
      label: "Disbursed",
      description: "Funds released to borrower",
      state: isRejected ? "upcoming" : stepState(loan.status, "DISBURSED", false),
      date: formatStepDate(loan.disbursedAt ?? undefined),
    },
    {
      id: "repayment",
      label: "Repayment",
      description:
        paymentCount > 0
          ? `${paymentCount} payment${paymentCount > 1 ? "s" : ""} recorded`
          : "Awaiting collections",
      state: isRejected
        ? "upcoming"
        : loan.status === "CLOSED"
          ? "done"
          : loan.status === "DISBURSED"
            ? "current"
            : stepState(loan.status, "DISBURSED", false) === "done"
              ? "current"
              : "upcoming",
      date:
        paymentCount > 0
          ? formatStepDate(loan.payments![loan.payments!.length - 1].paymentDate)
          : null,
    },
    {
      id: "closed",
      label: "Closed",
      description: "Loan fully repaid",
      state: loan.status === "CLOSED" ? "done" : "upcoming",
      date: formatStepDate(loan.closedAt ?? undefined),
    },
  ];

  if (isRejected) {
    return steps.filter((s) => s.id !== "repayment" && s.id !== "closed");
  }

  return steps;
}

export function getRepaymentProgress(loan: LoanApplication) {
  const total = loan.totalRepaymentAmount;
  const paid = loan.totalPaidAmount ?? 0;
  const percent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  return { total, paid, outstanding: loan.outstandingAmount, percent };
}
