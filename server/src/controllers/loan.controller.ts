import type { Request, Response } from "express";
import {
  applyForLoan,
  formatLoan,
  getActiveLoanForBorrower,
} from "../services/loan.service.js";

// POST /api/loans/apply
export async function applyLoan(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { principalAmount, tenureInDays } = req.body as {
      principalAmount?: number | string;
      tenureInDays?: number | string;
    };

    if (principalAmount === undefined || tenureInDays === undefined) {
      res.status(400).json({
        message: "principalAmount and tenureInDays are required",
      });
      return;
    }

    const principal = Number(principalAmount);
    const tenure = Number(tenureInDays);

    if (Number.isNaN(principal) || Number.isNaN(tenure)) {
      res.status(400).json({ message: "Invalid loan configuration values" });
      return;
    }

    const loan = await applyForLoan(req.user, principal, tenure);

    res.status(201).json({
      message: "Loan application submitted successfully and is pending review",
      loan: formatLoan(loan),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    if (
      message.includes("BRE") ||
      message.includes("Salary slip") ||
      message.includes("between") ||
      message.includes("active loan")
    ) {
      res.status(400).json({ message });
      return;
    }

    console.error("Apply loan error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/loans/my-application
export async function getMyLoan(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const loan = await getActiveLoanForBorrower(req.user._id);

    res.status(200).json({
      loan: loan ? formatLoan(loan) : null,
    });
  } catch (error) {
    console.error("Get my loan error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
