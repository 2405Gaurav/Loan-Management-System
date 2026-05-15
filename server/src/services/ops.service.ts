import type { Types } from "mongoose";
import {
  isValidLoanStatusTransition,
  LoanApprovalStatus,
  LoanStatus,
  UserRole,
} from "../models/enums.js";
import { Loan } from "../models/loan.model.js";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import type { UserDocument } from "../models/user.model.js";

const ACTIVE_LOAN_STATUSES = [
  LoanStatus.APPLIED,
  LoanStatus.SANCTIONED,
  LoanStatus.DISBURSED,
];

// Sales: borrowers with no in-flight loan (lead tracking)
export async function getSalesLeads() {
  const borrowers = await User.find({ role: UserRole.BORROWER })
    .select("email fullName profileCompleted brePassed salarySlipUploaded createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const borrowerIds = borrowers.map((b) => b._id);
  const activeLoans = await Loan.find({
    borrower: { $in: borrowerIds },
    status: { $in: ACTIVE_LOAN_STATUSES },
  })
    .select("borrower status")
    .lean();

  const borrowersWithActiveLoan = new Set(
    activeLoans.map((l) => String(l.borrower))
  );

  return borrowers
    .filter((b) => !borrowersWithActiveLoan.has(String(b._id)))
    .map((b) => ({
      id: String(b._id),
      email: b.email,
      fullName: b.fullName ?? "",
      profileCompleted: b.profileCompleted ?? false,
      brePassed: b.brePassed ?? false,
      salarySlipUploaded: b.salarySlipUploaded ?? false,
      registeredAt: b.createdAt,
    }));
}

function formatLoanForOps(loan: {
  _id: unknown;
  borrower: { _id?: unknown; email?: string; fullName?: string } | Types.ObjectId;
  principalAmount: number;
  tenureInDays: number;
  totalRepaymentAmount: number;
  outstandingAmount: number;
  totalPaidAmount?: number;
  status: LoanStatus;
  approvalStatus: LoanApprovalStatus;
  rejectionReason?: string;
  appliedAt: Date;
  sanctionedAt?: Date;
  disbursedAt?: Date;
}) {
  const borrower =
    typeof loan.borrower === "object" && loan.borrower && "email" in loan.borrower
      ? {
          id: String(loan.borrower._id),
          email: loan.borrower.email ?? "",
          fullName: loan.borrower.fullName ?? "",
        }
      : { id: String(loan.borrower), email: "", fullName: "" };

  return {
    id: String(loan._id),
    borrower,
    principalAmount: loan.principalAmount,
    tenureInDays: loan.tenureInDays,
    totalRepaymentAmount: loan.totalRepaymentAmount,
    outstandingAmount: loan.outstandingAmount,
    totalPaidAmount: loan.totalPaidAmount ?? 0,
    status: loan.status,
    approvalStatus: loan.approvalStatus,
    rejectionReason: loan.rejectionReason ?? "",
    appliedAt: loan.appliedAt,
    sanctionedAt: loan.sanctionedAt ?? null,
    disbursedAt: loan.disbursedAt ?? null,
  };
}

// Sanction queue: applied + pending approval
export async function getSanctionQueue() {
  const loans = await Loan.find({
    status: LoanStatus.APPLIED,
    approvalStatus: LoanApprovalStatus.PENDING,
  })
    .populate("borrower", "email fullName")
    .sort({ appliedAt: 1 });

  return loans.map(formatLoanForOps);
}

export async function approveLoan(loanId: string) {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new Error("Loan not found");

  if (!isValidLoanStatusTransition(loan.status, LoanStatus.SANCTIONED)) {
    throw new Error(`Cannot sanction loan in ${loan.status} status`);
  }

  loan.status = LoanStatus.SANCTIONED;
  loan.approvalStatus = LoanApprovalStatus.APPROVED;
  loan.sanctionedAt = new Date();
  loan.rejectionReason = undefined;
  await loan.save();
  return loan;
}

export async function rejectLoan(loanId: string, rejectionReason: string) {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new Error("Loan not found");

  if (!rejectionReason?.trim()) {
    throw new Error("Rejection reason is required");
  }

  if (!isValidLoanStatusTransition(loan.status, LoanStatus.REJECTED)) {
    throw new Error(`Cannot reject loan in ${loan.status} status`);
  }

  loan.status = LoanStatus.REJECTED;
  loan.approvalStatus = LoanApprovalStatus.REJECTED;
  loan.rejectionReason = rejectionReason.trim();
  loan.outstandingAmount = 0;
  await loan.save();
  return loan;
}

// Disbursement queue: sanctioned loans awaiting fund release
export async function getDisbursementQueue() {
  const loans = await Loan.find({ status: LoanStatus.SANCTIONED })
    .populate("borrower", "email fullName")
    .sort({ sanctionedAt: 1 });

  return loans.map(formatLoanForOps);
}

export async function disburseLoan(loanId: string) {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new Error("Loan not found");

  if (!isValidLoanStatusTransition(loan.status, LoanStatus.DISBURSED)) {
    throw new Error(`Cannot disburse loan in ${loan.status} status`);
  }

  loan.status = LoanStatus.DISBURSED;
  loan.disbursedAt = new Date();
  await loan.save();
  return loan;
}

// Collection: active disbursed loans
export async function getCollectionQueue() {
  const loans = await Loan.find({ status: LoanStatus.DISBURSED })
    .populate("borrower", "email fullName")
    .sort({ disbursedAt: 1 });

  return loans.map(formatLoanForOps);
}

export async function getPaymentsForLoan(loanId: string) {
  const payments = await Payment.find({ loan: loanId })
    .populate("recordedBy", "email")
    .sort({ paymentDate: -1 });

  return payments.map((p) => ({
    id: String(p._id),
    utrNumber: p.utrNumber,
    amount: p.amount,
    paymentDate: p.paymentDate,
    remainingBalanceAfterPayment: p.remainingBalanceAfterPayment,
    recordedBy: typeof p.recordedBy === "object" && p.recordedBy && "email" in p.recordedBy
      ? p.recordedBy.email
      : "",
    createdAt: p.createdAt,
  }));
}

// Record payment — UTR unique globally; auto-close when fully paid
export async function recordPayment(
  staff: UserDocument,
  input: {
    loanId: string;
    utrNumber: string;
    amount: number;
    paymentDate: string;
  }
) {
  const { loanId, utrNumber, amount, paymentDate } = input;

  if (!utrNumber?.trim()) {
    throw new Error("UTR number is required");
  }

  const normalizedUtr = utrNumber.trim().toUpperCase();

  const existingUtr = await Payment.findOne({ utrNumber: normalizedUtr });
  if (existingUtr) {
    throw new Error("UTR number already exists — each payment must have a unique UTR");
  }

  if (!amount || amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  const loan = await Loan.findById(loanId).populate("borrower", "email fullName");
  if (!loan) throw new Error("Loan not found");

  if (loan.status !== LoanStatus.DISBURSED) {
    throw new Error("Payments can only be recorded for disbursed loans");
  }

  if (amount > loan.outstandingAmount) {
    throw new Error(
      `Payment cannot exceed outstanding balance of ₹${loan.outstandingAmount}`
    );
  }

  const paidAt = new Date(paymentDate);
  if (Number.isNaN(paidAt.getTime())) {
    throw new Error("Invalid payment date");
  }

  const newOutstanding = Math.round((loan.outstandingAmount - amount) * 100) / 100;
  const newTotalPaid = Math.round(((loan.totalPaidAmount ?? 0) + amount) * 100) / 100;

  const payment = await Payment.create({
    loan: loan._id,
    borrower: loan.borrower,
    utrNumber: normalizedUtr,
    amount,
    paymentDate: paidAt,
    remainingBalanceAfterPayment: newOutstanding,
    recordedBy: staff._id,
  });

  loan.totalPaidAmount = newTotalPaid;
  loan.outstandingAmount = newOutstanding;

  // Auto-close when total paid equals total repayment
  if (newOutstanding <= 0) {
    loan.outstandingAmount = 0;
    loan.status = LoanStatus.CLOSED;
    loan.closedAt = new Date();
  }

  await loan.save();

  return { payment, loan };
}
