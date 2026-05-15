// Client-side mirror of backend loan math (assignment formula)
const RATE = 12;

export const LOAN_MIN_AMOUNT = 50_000;
export const LOAN_MAX_AMOUNT = 500_000;
export const LOAN_MIN_TENURE = 30;
export const LOAN_MAX_TENURE = 365;

export function calculateSimpleInterest(
  principal: number,
  tenureInDays: number,
  ratePercent: number = RATE
): number {
  return (principal * ratePercent * tenureInDays) / (365 * 100);
}

export function calculateLoanTotals(principal: number, tenureInDays: number) {
  const simpleInterest = Math.round(calculateSimpleInterest(principal, tenureInDays) * 100) / 100;
  const totalRepaymentAmount = Math.round((principal + simpleInterest) * 100) / 100;

  return {
    simpleInterest,
    totalRepaymentAmount,
    outstandingAmount: totalRepaymentAmount,
    interestRate: RATE,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
