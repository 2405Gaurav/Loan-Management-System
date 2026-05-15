import type { Request, Response } from "express";
import { UserRole } from "../models/enums.js";
import { getModulesForRole } from "../middleware/staff.middleware.js";
import * as opsService from "../services/ops.service.js";

function handleOpsError(res: Response, error: unknown, fallback: string): void {
  const message = error instanceof Error ? error.message : fallback;
  const status =
    message.includes("not found") ? 404 :
    message.includes("required") || message.includes("Invalid") || message.includes("Cannot") || message.includes("exceed") || message.includes("UTR") ? 400 :
    500;
  res.status(status).json({ message });
}

// Dashboard meta: which modules this user can open
export async function getDashboardMeta(req: Request, res: Response): Promise<void> {
  const role = req.user!.role as UserRole;
  res.status(200).json({
    role,
    modules: getModulesForRole(role),
  });
}

export async function getSalesLeads(_req: Request, res: Response): Promise<void> {
  try {
    const leads = await opsService.getSalesLeads();
    res.status(200).json({ leads });
  } catch (error) {
    handleOpsError(res, error, "Failed to fetch sales leads");
  }
}

export async function getSanctionQueue(_req: Request, res: Response): Promise<void> {
  try {
    const loans = await opsService.getSanctionQueue();
    res.status(200).json({ loans });
  } catch (error) {
    handleOpsError(res, error, "Failed to fetch sanction queue");
  }
}

export async function approveLoan(req: Request, res: Response): Promise<void> {
  try {
    const loan = await opsService.approveLoan(req.params.id as string);
    res.status(200).json({ message: "Loan sanctioned", loanId: String(loan._id) });
  } catch (error) {
    handleOpsError(res, error, "Failed to approve loan");
  }
}

export async function rejectLoan(req: Request, res: Response): Promise<void> {
  try {
    const { rejectionReason } = req.body as { rejectionReason?: string };
    const loan = await opsService.rejectLoan(
      req.params.id as string,
      rejectionReason ?? ""
    );
    res.status(200).json({ message: "Loan rejected", loanId: String(loan._id) });
  } catch (error) {
    handleOpsError(res, error, "Failed to reject loan");
  }
}

export async function getDisbursementQueue(_req: Request, res: Response): Promise<void> {
  try {
    const loans = await opsService.getDisbursementQueue();
    res.status(200).json({ loans });
  } catch (error) {
    handleOpsError(res, error, "Failed to fetch disbursement queue");
  }
}

export async function disburseLoan(req: Request, res: Response): Promise<void> {
  try {
    const loan = await opsService.disburseLoan(req.params.id as string);
    res.status(200).json({ message: "Loan disbursed", loanId: String(loan._id) });
  } catch (error) {
    handleOpsError(res, error, "Failed to disburse loan");
  }
}

export async function getCollectionQueue(_req: Request, res: Response): Promise<void> {
  try {
    const loans = await opsService.getCollectionQueue();
    res.status(200).json({ loans });
  } catch (error) {
    handleOpsError(res, error, "Failed to fetch collection queue");
  }
}

export async function getLoanPayments(req: Request, res: Response): Promise<void> {
  try {
    const payments = await opsService.getPaymentsForLoan(req.params.id as string);
    res.status(200).json({ payments });
  } catch (error) {
    handleOpsError(res, error, "Failed to fetch payments");
  }
}

export async function recordPayment(req: Request, res: Response): Promise<void> {
  try {
    const { loanId, utrNumber, amount, paymentDate } = req.body as {
      loanId?: string;
      utrNumber?: string;
      amount?: number;
      paymentDate?: string;
    };

    if (!loanId) {
      res.status(400).json({ message: "loanId is required" });
      return;
    }

    const result = await opsService.recordPayment(req.user!, {
      loanId,
      utrNumber: utrNumber ?? "",
      amount: Number(amount),
      paymentDate: paymentDate ?? "",
    });

    res.status(201).json({
      message: result.loan.status === "CLOSED" ? "Payment recorded — loan closed" : "Payment recorded",
      payment: {
        id: String(result.payment._id),
        utrNumber: result.payment.utrNumber,
        amount: result.payment.amount,
        remainingBalanceAfterPayment: result.payment.remainingBalanceAfterPayment,
      },
      loan: {
        id: String(result.loan._id),
        status: result.loan.status,
        outstandingAmount: result.loan.outstandingAmount,
        totalPaidAmount: result.loan.totalPaidAmount,
      },
    });
  } catch (error) {
    handleOpsError(res, error, "Failed to record payment");
  }
}
