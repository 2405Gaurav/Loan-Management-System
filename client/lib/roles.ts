export type UserRole =
  | "ADMIN"
  | "SALES"
  | "SANCTION"
  | "DISBURSEMENT"
  | "COLLECTION"
  | "BORROWER";

export const STAFF_ROLES: UserRole[] = [
  "ADMIN",
  "SALES",
  "SANCTION",
  "DISBURSEMENT",
  "COLLECTION",
];

export function isStaffRole(role?: string): boolean {
  return STAFF_ROLES.includes(role as UserRole);
}
