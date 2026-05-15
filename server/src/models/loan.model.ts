import mongoose, { type HydratedDocument, type Model, Schema, Types } from "mongoose";
import {
  LOAN_INTEREST_RATE_PERCENT,
  LOAN_PRINCIPAL_MAX,
  LOAN_PRINCIPAL_MIN,
  LOAN_TENURE_MAX_DAYS,
  LOAN_TENURE_MIN_DAYS,
} from "../constants/loan.constants.js";
import { LoanApprovalStatus, LoanStatus } from "./enums.js";

export interface ILoan {
  borrower: Types.ObjectId;
  salarySlipDocument: Types.ObjectId;
  principalAmount: number;
  tenureInDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepaymentAmount: number;
  totalPaidAmount: number;
  outstandingAmount: number;
  status: LoanStatus;
  approvalStatus: LoanApprovalStatus;
  rejectionReason?: string;
  appliedAt: Date;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type LoanDocument = HydratedDocument<ILoan>;
export type LoanModel = Model<ILoan>;

const loanSchema = new Schema<ILoan, LoanModel>(
  {
    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    salarySlipDocument: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    principalAmount: {
      type: Number,
      required: true,
      min: LOAN_PRINCIPAL_MIN,
      max: LOAN_PRINCIPAL_MAX,
    },
    tenureInDays: {
      type: Number,
      required: true,
      min: LOAN_TENURE_MIN_DAYS,
      max: LOAN_TENURE_MAX_DAYS,
    },
    interestRate: {
      type: Number,
      required: true,
      default: LOAN_INTEREST_RATE_PERCENT,
    },
    simpleInterest: {
      type: Number,
      required: true,
      min: 0,
    },
    totalRepaymentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPaidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    sanctionedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.APPLIED,
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(LoanApprovalStatus),
      default: LoanApprovalStatus.PENDING,
      required: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    appliedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

loanSchema.index({ borrower: 1, status: 1 });
loanSchema.index({ status: 1, appliedAt: -1 });
loanSchema.index({ approvalStatus: 1, status: 1 });

export const Loan = mongoose.model<ILoan, LoanModel>("Loan", loanSchema);
