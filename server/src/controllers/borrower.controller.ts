import type { Request, Response } from "express";
import { EmploymentType } from "../models/enums.js";
import { runBreChecks } from "../services/bre.service.js";
import { getBorrowerLoanEligibility } from "../services/borrower-loan-eligibility.service.js";
import {
  formatLoan,
  formatLoanWithPayments,
  getLatestLoanForBorrower,
} from "../services/loan.service.js";
import {
  isMongoPanDuplicateError,
  isPanRegisteredByAnotherUser,
  normalizePan,
  PAN_DUPLICATE_MESSAGE,
} from "../utils/pan.js";

function formatBorrowerProfile(user: {
  _id: unknown;
  email: string;
  fullName?: string;
  panNumber?: string;
  dateOfBirth?: Date;
  monthlySalary?: number;
  employmentType?: EmploymentType;
  profileCompleted: boolean;
  brePassed: boolean;
  salarySlipUploaded: boolean;
}) {
  return {
    id: String(user._id),
    email: user.email,
    fullName: user.fullName ?? "",
    panNumber: user.panNumber ?? "",
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split("T")[0] : "",
    monthlySalary: user.monthlySalary ?? 0,
    employmentType: user.employmentType ?? "",
    profileCompleted: user.profileCompleted,
    brePassed: user.brePassed,
    salarySlipUploaded: user.salarySlipUploaded,
  };
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const [latestLoan, eligibility] = await Promise.all([
      getLatestLoanForBorrower(req.user._id),
      getBorrowerLoanEligibility(req.user._id),
    ]);

    const formattedLatest = latestLoan
      ? await formatLoanWithPayments(latestLoan)
      : null;
    const formattedBlocking = eligibility.blockingLoan
      ? await formatLoanWithPayments(eligibility.blockingLoan)
      : null;

    res.status(200).json({
      user: formatBorrowerProfile(req.user),
      activeLoan: formattedLatest,
      blockingLoan: formattedBlocking,
      canApplyForNewLoan: eligibility.canApplyForNewLoan,
      applyBlockReason: eligibility.applyBlockReason,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function submitProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { fullName, panNumber, dateOfBirth, monthlySalary, employmentType } =
      req.body as {
        fullName?: string;
        panNumber?: string;
        dateOfBirth?: string;
        monthlySalary?: number | string;
        employmentType?: string;
      };

    if (!fullName?.trim()) {
      res.status(400).json({ message: "Full name is required" });
      return;
    }

    if (!panNumber?.trim()) {
      res.status(400).json({ message: "PAN number is required" });
      return;
    }

    if (!dateOfBirth) {
      res.status(400).json({ message: "Date of birth is required" });
      return;
    }

    if (monthlySalary === undefined || monthlySalary === "") {
      res.status(400).json({ message: "Monthly salary is required" });
      return;
    }

    if (!employmentType) {
      res.status(400).json({ message: "Employment type is required" });
      return;
    }

    const parsedSalary = Number(monthlySalary);
    if (Number.isNaN(parsedSalary) || parsedSalary < 0) {
      res.status(400).json({ message: "Monthly salary must be a valid number" });
      return;
    }

    const parsedDob = new Date(dateOfBirth);
    if (Number.isNaN(parsedDob.getTime())) {
      res.status(400).json({ message: "Invalid date of birth" });
      return;
    }

    if (!Object.values(EmploymentType).includes(employmentType as EmploymentType)) {
      res.status(400).json({ message: "Invalid employment type" });
      return;
    }

    const user = req.user;
    const normalizedPan = normalizePan(panNumber);

    if (await isPanRegisteredByAnotherUser(normalizedPan, user._id)) {
      res.status(409).json({ message: PAN_DUPLICATE_MESSAGE });
      return;
    }

    user.fullName = fullName.trim();
    user.panNumber = normalizedPan;
    user.dateOfBirth = parsedDob;
    user.monthlySalary = parsedSalary;
    user.employmentType = employmentType as EmploymentType;

    const breResult = runBreChecks({
      dateOfBirth: parsedDob,
      monthlySalary: parsedSalary,
      panNumber: user.panNumber,
      employmentType: user.employmentType,
    });

    if (breResult.passed) {
      user.profileCompleted = true;
      user.brePassed = true;
    } else {
      user.profileCompleted = false;
      user.brePassed = false;
    }

    // Store every BRE attempt for sales lead timeline
    if (!user.breHistory) {
      user.breHistory = [];
    }
    user.breHistory.push({
      passed: breResult.passed,
      failureReasons: breResult.errors,
      attemptedAt: new Date(),
    });

    try {
      await user.save();
    } catch (saveError: unknown) {
      if (isMongoPanDuplicateError(saveError)) {
        res.status(409).json({ message: PAN_DUPLICATE_MESSAGE });
        return;
      }
      throw saveError;
    }

    const [latestLoan, eligibility] = await Promise.all([
      getLatestLoanForBorrower(user._id),
      getBorrowerLoanEligibility(user._id),
    ]);

    const formattedLatest = latestLoan
      ? await formatLoanWithPayments(latestLoan)
      : null;
    const formattedBlocking = eligibility.blockingLoan
      ? await formatLoanWithPayments(eligibility.blockingLoan)
      : null;

    res.status(200).json({
      passed: breResult.passed,
      errors: breResult.errors,
      user: formatBorrowerProfile(user),
      activeLoan: formattedLatest,
      blockingLoan: formattedBlocking,
      canApplyForNewLoan: eligibility.canApplyForNewLoan,
      applyBlockReason: eligibility.applyBlockReason,
    });
  } catch (error) {
    console.error("Submit profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
