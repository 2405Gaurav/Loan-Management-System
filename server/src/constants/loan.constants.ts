// Fixed product rules from assignment
export const LOAN_INTEREST_RATE_PERCENT = 12;

export const LOAN_PRINCIPAL_MIN = 50_000;
export const LOAN_PRINCIPAL_MAX = 500_000;

export const LOAN_TENURE_MIN_DAYS = 30;
export const LOAN_TENURE_MAX_DAYS = 365;

export const DOCUMENT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_SALARY_SLIP_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;
