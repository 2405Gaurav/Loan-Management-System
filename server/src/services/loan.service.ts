import type { Types } from "mongoose";
import {
  LOAN_PRINCIPAL_MAX,
  LOAN_PRINCIPAL_MIN,
  LOAN_TENURE_MAX_DAYS,
  LOAN_TENURE_MIN_DAYS,
} from "../constants/loan.constants.js";
import { calculateLoanAmounts } from "../utils/loan-calculations.js";
import { LoanApprovalStatus, LoanStatus } from "../models/enums.js";
import { Loan } from "../models/loan.model.js";
import { Payment } from "../models/payment.model.js";
import type { UserDocument } from "../models/user.model.js";
import { DocumentType } from "../models/enums.js";
import { Document, type DocumentRecord } from "../models/document.model.js";

// Prevent duplicate open applications for same borrower
const ACTIVE_LOAN_STATUSES = [
  LoanStatus.APPLIED,
  LoanStatus.SANCTIONED,
  LoanStatus.DISBURSED,
];

export async function getActiveLoanForBorrower(borrowerId: Types.ObjectId) {
  return Loan.findOne({
    borrower: borrowerId,
    status: { $in: ACTIVE_LOAN_STATUSES },
  })
    .sort({ appliedAt: -1 })
    .populate("salarySlipDocument", "originalFileName mimeType uploadedAt");
}

// Latest loan for borrower dashboard — includes closed/rejected for full history
export async function getLatestLoanForBorrower(borrowerId: Types.ObjectId) {
  return Loan.findOne({ borrower: borrowerId })
    .sort({ appliedAt: -1 })
    .populate("salarySlipDocument", "originalFileName mimeType uploadedAt");
}

export async function getPaymentsForBorrowerLoan(loanId: Types.ObjectId) {
  const payments = await Payment.find({ loan: loanId })
    .populate("recordedBy", "email fullName")
    .sort({ paymentDate: 1 });

  return payments.map((p) => ({
    id: String(p._id),
    utrNumber: p.utrNumber,
    amount: p.amount,
    paymentDate: p.paymentDate,
    remainingBalanceAfterPayment: p.remainingBalanceAfterPayment,
    recordedBy:
      typeof p.recordedBy === "object" &&
      p.recordedBy &&
      "email" in p.recordedBy
        ? String(
            (p.recordedBy as { fullName?: string; email?: string }).fullName ||
              (p.recordedBy as { email?: string }).email ||
              "Collection team"
          )
        : "Collection team",
    createdAt: p.createdAt,
  }));
}

// Create a new loan application with APPLIED status
export async function applyForLoan(
  user: UserDocument,
  principalAmount: number,
  tenureInDays: number
) {
  if (!user.brePassed) {
    throw new Error("BRE must pass before applying for a loan");
  }

  if (!user.salarySlipUploaded) {
    throw new Error("Salary slip must be uploaded before applying for a loan");
  }

  if (principalAmount < LOAN_PRINCIPAL_MIN || principalAmount > LOAN_PRINCIPAL_MAX) {
    throw new Error(
      `Loan amount must be between ${LOAN_PRINCIPAL_MIN} and ${LOAN_PRINCIPAL_MAX}`
    );
  }

  if (tenureInDays < LOAN_TENURE_MIN_DAYS || tenureInDays > LOAN_TENURE_MAX_DAYS) {
    throw new Error(
      `Tenure must be between ${LOAN_TENURE_MIN_DAYS} and ${LOAN_TENURE_MAX_DAYS} days`
    );
  }

  const existingActiveLoan = await getActiveLoanForBorrower(user._id);
  if (existingActiveLoan) {
    throw new Error("You already have an active loan application");
  }

  const salarySlip = await Document.findOne({
    borrower: user._id,
    documentType: DocumentType.SALARY_SLIP,
  }).sort({ uploadedAt: -1 });

  if (!salarySlip) {
    throw new Error("Salary slip document not found");
  }

  const { simpleInterest, totalRepaymentAmount, outstandingAmount } =
    calculateLoanAmounts(principalAmount, tenureInDays);

  // status = APPLIED (lifecycle), approvalStatus = PENDING (staff review queue)
  const loan = await Loan.create({
    borrower: user._id,
    salarySlipDocument: salarySlip._id,
    principalAmount,
    tenureInDays,
    interestRate: 12,
    simpleInterest,
    totalRepaymentAmount,
    outstandingAmount,
    status: LoanStatus.APPLIED,
    approvalStatus: LoanApprovalStatus.PENDING,
    appliedAt: new Date(),
  });

  // Optionally link document to created loan
  await Document.findByIdAndUpdate(salarySlip._id, { loan: loan._id });

  return loan.populate("salarySlipDocument", "originalFileName mimeType uploadedAt");
}

export function formatLoan(loan: {
  _id: unknown;
  principalAmount: number;
  tenureInDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepaymentAmount: number;
  totalPaidAmount?: number;
  outstandingAmount: number;
  status: LoanStatus;
  approvalStatus: LoanApprovalStatus;
  rejectionReason?: string;
  appliedAt: Date;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  salarySlipDocument?: DocumentRecord | Types.ObjectId;
}) {
  const salaryDoc =
    loan.salarySlipDocument &&
    typeof loan.salarySlipDocument === "object" &&
    "originalFileName" in loan.salarySlipDocument
      ? {
          id: String(loan.salarySlipDocument._id),
          originalFileName: loan.salarySlipDocument.originalFileName,
          mimeType: loan.salarySlipDocument.mimeType,
          uploadedAt: loan.salarySlipDocument.uploadedAt,
        }
      : null;

  return {
    id: String(loan._id),
    principalAmount: loan.principalAmount,
    tenureInDays: loan.tenureInDays,
    interestRate: loan.interestRate,
    simpleInterest: loan.simpleInterest,
    totalRepaymentAmount: loan.totalRepaymentAmount,
    totalPaidAmount: loan.totalPaidAmount ?? 0,
    outstandingAmount: loan.outstandingAmount,
    status: loan.status,
    approvalStatus: loan.approvalStatus ?? LoanApprovalStatus.PENDING,
    rejectionReason: loan.rejectionReason ?? "",
    appliedAt: loan.appliedAt,
    sanctionedAt: loan.sanctionedAt ?? null,
    disbursedAt: loan.disbursedAt ?? null,
    closedAt: loan.closedAt ?? null,
    salarySlipDocument: salaryDoc,
    payments: [],
  };
}

export async function formatLoanWithPayments(
  loan: NonNullable<Awaited<ReturnType<typeof getLatestLoanForBorrower>>>
) {
  const base = formatLoan(loan);
  const payments = await getPaymentsForBorrowerLoan(loan._id);
  return { ...base, payments };
}
