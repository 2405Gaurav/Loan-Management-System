import { LOAN_INTEREST_RATE_PERCENT } from "../constants/loan.constants.js";

// Simple Interest: SI = (P × R × T) / (365 × 100)
export function calculateSimpleInterest(
  principal: number,
  tenureInDays: number,
  ratePercent: number = LOAN_INTEREST_RATE_PERCENT
): number {
  return (principal * ratePercent * tenureInDays) / (365 * 100);
}

export function calculateLoanAmounts(
  principal: number,
  tenureInDays: number,
  ratePercent: number = LOAN_INTEREST_RATE_PERCENT
) {
  const simpleInterest = roundCurrency(
    calculateSimpleInterest(principal, tenureInDays, ratePercent)
  );
  const totalRepaymentAmount = roundCurrency(principal + simpleInterest);

  return {
    simpleInterest,
    totalRepaymentAmount,
    outstandingAmount: totalRepaymentAmount,
  };
}

export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}
