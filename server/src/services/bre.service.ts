import { EmploymentType } from "../models/enums.js";

// Indian PAN format: 5 letters + 4 digits + 1 letter
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// BRE business rule thresholds from assignment
const MIN_AGE = 23;
const MAX_AGE = 50;
const MIN_MONTHLY_SALARY = 25000;

export interface BreInput {
  dateOfBirth: Date;
  monthlySalary: number;
  panNumber: string;
  employmentType: EmploymentType;
}

export interface BreResult {
  passed: boolean;
  errors: string[];
}

// Calculate age in full years from date of birth
export function calculateAge(
  dateOfBirth: Date,
  referenceDate: Date = new Date()
): number {
  let age = referenceDate.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = referenceDate.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

// Validate PAN string against Indian PAN regex
export function isValidPan(panNumber: string): boolean {
  return PAN_REGEX.test(panNumber.toUpperCase().trim());
}

// Run all BRE rules and collect every rejection reason
export function runBreChecks(input: BreInput): BreResult {
  const errors: string[] = [];

  // Rule 1: Age must be between 23 and 50 (inclusive)
  const age = calculateAge(input.dateOfBirth);
  if (age < MIN_AGE || age > MAX_AGE) {
    errors.push("Applicant age must be between 23 and 50");
  }

  // Rule 2: Monthly salary must be at least 25000
  if (input.monthlySalary < MIN_MONTHLY_SALARY) {
    errors.push("Salary must be at least 25000");
  }

  // Rule 3: PAN must match valid Indian format
  if (!isValidPan(input.panNumber)) {
    errors.push("Invalid PAN number");
  }

  // Rule 4: Unemployed applicants are not eligible
  if (input.employmentType === EmploymentType.UNEMPLOYED) {
    errors.push("Employment status cannot be UNEMPLOYED");
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}
