import type { NextFunction, Request, Response } from "express";
import { UserRole } from "../models/enums.js";

// Factory: allow only listed roles — returns 403 if role not permitted
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userRole = req.user.role as UserRole;

    // Admin bypasses role checks on all ops routes
    if (userRole === UserRole.ADMIN) {
      next();
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        message: "Forbidden: you do not have access to this resource",
      });
      return;
    }

    next();
  };
}

// Block borrowers from executive dashboard APIs entirely
export function blockBorrowerFromOps(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (req.user.role === UserRole.BORROWER) {
    res.status(403).json({
      message: "Forbidden: borrowers cannot access the operations dashboard",
    });
    return;
  }

  next();
}
