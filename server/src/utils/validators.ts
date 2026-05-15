import {
  BRE_MAX_AGE,
  BRE_MIN_AGE,
  SALARY_MIN_FOR_BRE,
} from "../constants/loan.constants.js";
import { EmploymentType } from "../models/enums.ts";

/** Indian PAN: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F) */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export function isValidPan(pan: string): boolean {
  return PAN_REGEX.test(pan.toUpperCase());
}

export function calculateAge(dob: Date, referenceDate: Date = new Date()): number {
  let age = referenceDate.getFullYear() - dob.getFullYear();
  const monthDiff = referenceDate.getMonth() - dob.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getDate() < dob.getDate())
  ) {
    age -= 1;
  }
  return age;
}

export interface BreEvaluationResult {
  eligible: boolean;
  reasons: string[];
}

export function evaluateBreRules(input: {
  dateOfBirth?: Date;
  monthlySalary?: number;
  pan?: string;
  employmentType?: EmploymentType;
}): BreEvaluationResult {
  const reasons: string[] = [];

  if (input.employmentType === EmploymentType.UNEMPLOYED) {
    reasons.push("Employment status cannot be UNEMPLOYED");
  }

  if (input.dateOfBirth) {
    const age = calculateAge(input.dateOfBirth);
    if (age < BRE_MIN_AGE || age > BRE_MAX_AGE) {
      reasons.push(`Age must be between ${BRE_MIN_AGE} and ${BRE_MAX_AGE}`);
    }
  } else {
    reasons.push("Date of birth is required for BRE evaluation");
  }

  if (input.monthlySalary === undefined || input.monthlySalary < SALARY_MIN_FOR_BRE) {
    reasons.push(`Monthly salary must be at least ${SALARY_MIN_FOR_BRE}`);
  }

  if (!input.pan || !isValidPan(input.pan)) {
    reasons.push("PAN must be in valid format (e.g. ABCDE1234F)");
  }

  return { eligible: reasons.length === 0, reasons };
}
