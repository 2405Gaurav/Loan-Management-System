import type { Request, Response } from "express";
import { EmploymentType } from "../models/enums.js";
import { runBreChecks } from "../services/bre.service.js";
import { formatLoan, getActiveLoanForBorrower } from "../services/loan.service.js";

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

    const activeLoan = await getActiveLoanForBorrower(req.user._id);

    res.status(200).json({
      user: formatBorrowerProfile(req.user),
      activeLoan: activeLoan ? formatLoan(activeLoan) : null,
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

    user.fullName = fullName.trim();
    user.panNumber = panNumber.toUpperCase().trim();
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

    await user.save();

    const activeLoan = await getActiveLoanForBorrower(user._id);

    res.status(200).json({
      passed: breResult.passed,
      errors: breResult.errors,
      user: formatBorrowerProfile(user),
      activeLoan: activeLoan ? formatLoan(activeLoan) : null,
    });
  } catch (error) {
    console.error("Submit profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
