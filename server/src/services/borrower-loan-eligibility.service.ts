import type { Types } from "mongoose";
import { LoanStatus } from "../models/enums.js";
import { Loan } from "../models/loan.model.js";

// Only CLOSED or REJECTED (or no loan) allows a new application
export const BLOCKING_LOAN_STATUSES = [
  LoanStatus.APPLIED,
  LoanStatus.SANCTIONED,
  LoanStatus.DISBURSED,
] as const;

export async function getBlockingLoanForBorrower(borrowerId: Types.ObjectId) {
  return Loan.findOne({
    borrower: borrowerId,
    status: { $in: BLOCKING_LOAN_STATUSES },
  }).sort({ appliedAt: -1 });
}

export function getNewLoanBlockReason(status: LoanStatus): string {
  switch (status) {
    case LoanStatus.DISBURSED:
      return "You cannot apply for a new loan until your current loan is fully repaid and automatically closed. Complete repayments on your dashboard — the loan closes automatically when the outstanding balance reaches zero.";
    case LoanStatus.SANCTIONED:
      return "You have a sanctioned loan awaiting disbursement. A new application is allowed only after this loan is fully repaid and closed, or if it is rejected.";
    case LoanStatus.APPLIED:
      return "You already have a loan application under review. Please wait for a decision before applying again.";
    default:
      return "You already have an active loan. A new application is allowed only after your current loan is fully repaid and automatically closed.";
  }
}

export async function getBorrowerLoanEligibility(borrowerId: Types.ObjectId) {
  const blockingLoan = await getBlockingLoanForBorrower(borrowerId);
  const canApplyForNewLoan = !blockingLoan;
  const applyBlockReason = blockingLoan
    ? getNewLoanBlockReason(blockingLoan.status)
    : null;

  return { blockingLoan, canApplyForNewLoan, applyBlockReason };
}
