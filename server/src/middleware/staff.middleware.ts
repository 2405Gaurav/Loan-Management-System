import { UserRole } from "../models/enums.js";

// Roles that can use the operations dashboard
export const STAFF_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SALES,
  UserRole.SANCTION,
  UserRole.DISBURSEMENT,
  UserRole.COLLECTION,
];

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

// Which dashboard modules each role may open (admin gets all)
export function getModulesForRole(role: UserRole): string[] {
  if (role === UserRole.ADMIN) {
    return ["sales", "sanction", "disbursement", "collection"];
  }
  if (role === UserRole.SALES) return ["sales"];
  if (role === UserRole.SANCTION) return ["sanction"];
  if (role === UserRole.DISBURSEMENT) return ["disbursement"];
  if (role === UserRole.COLLECTION) return ["collection"];
  return [];
}
