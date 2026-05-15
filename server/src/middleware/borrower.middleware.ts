import type { NextFunction, Request, Response } from "express";
import { UserRole } from "../models/enums.js";

// Borrower portal routes — staff and admin get 403
export function requireBorrower(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (req.user.role !== UserRole.BORROWER) {
    res.status(403).json({
      message: "Forbidden: only borrowers can access the application portal",
    });
    return;
  }

  next();
}
