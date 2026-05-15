//all these enums are as per requirment i felt i will update these if i req 

export enum UserRole {
  ADMIN = "ADMIN",
  SALES = "SALES",
  SANCTION = "SANCTION",
  DISBURSEMENT = "DISBURSEMENT",
  COLLECTION = "COLLECTION",
  BORROWER = "BORROWER",
}

export enum LoanStatus {
  APPLIED = "APPLIED",
  SANCTIONED = "SANCTIONED",
  DISBURSED = "DISBURSED",
  CLOSED = "CLOSED",
  REJECTED = "REJECTED",
}

export enum EmploymentType {
  SALARIED = "SALARIED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  UNEMPLOYED = "UNEMPLOYED",
}

export enum DocumentType {
  SALARY_SLIP = "SALARY_SLIP",
  PAN_CARD = "PAN_CARD",
  ID_PROOF = "ID_PROOF",
  OTHER = "OTHER",
}

export enum ProfileCompletionStep {
  REGISTERED = "REGISTERED",
  PERSONAL_DETAILS = "PERSONAL_DETAILS",
  SALARY_SLIP_UPLOADED = "SALARY_SLIP_UPLOADED",
  LOAN_APPLIED = "LOAN_APPLIED",
  COMPLETED = "COMPLETED",
}

export enum BreEligibilityStatus {
  PENDING = "PENDING",
  ELIGIBLE = "ELIGIBLE",
  INELIGIBLE = "INELIGIBLE",
}

//Allowed loan status transitions for workflow guards
// a state transition map
// to prevents invalid loan lifecycle changes. 
// it enforece that if the loan is in applied state then it can only be moved to sanctioned or rejected state.
export const LOAN_STATUS_TRANSITIONS: Record<LoanStatus, LoanStatus[]> = {
  [LoanStatus.APPLIED]: [LoanStatus.SANCTIONED, LoanStatus.REJECTED],
  [LoanStatus.SANCTIONED]: [LoanStatus.DISBURSED],
  [LoanStatus.DISBURSED]: [LoanStatus.CLOSED],
  [LoanStatus.REJECTED]: [],
  [LoanStatus.CLOSED]: [],
};

export function isValidLoanStatusTransition(
  from: LoanStatus,
  to: LoanStatus
): boolean {
  return LOAN_STATUS_TRANSITIONS[from].includes(to);
}
