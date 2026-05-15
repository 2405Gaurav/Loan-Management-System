import type { Request, Response } from "express";
import { EmploymentType } from "../models/enums.js";
import { runBreChecks } from "../services/bre.service.js";

// Shape of borrower profile fields returned to frontend
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
  };
}

// GET /api/borrower/profile — fetch logged-in borrower profile state
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      user: formatBorrowerProfile(req.user),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/borrower/profile — save personal details and run BRE engine
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

    // Basic request validation before BRE
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

    // Persist submitted personal details on user document
    user.fullName = fullName.trim();
    user.panNumber = panNumber.toUpperCase().trim();
    user.dateOfBirth = parsedDob;
    user.monthlySalary = parsedSalary;
    user.employmentType = employmentType as EmploymentType;

    // Run BRE engine with assignment rules
    const breResult = runBreChecks({
      dateOfBirth: parsedDob,
      monthlySalary: parsedSalary,
      panNumber: user.panNumber,
      employmentType: user.employmentType,
    });

    if (breResult.passed) {
      // BRE passed: mark profile complete and eligible for loan flow
      user.profileCompleted = true;
      user.brePassed = true;
    } else {
      // BRE failed: save details but keep flags false so user can retry
      user.profileCompleted = false;
      user.brePassed = false;
    }

    await user.save();

    // Return BRE result in required format
    res.status(200).json({
      passed: breResult.passed,
      errors: breResult.errors,
      user: formatBorrowerProfile(user),
    });
  } catch (error) {
    console.error("Submit profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
