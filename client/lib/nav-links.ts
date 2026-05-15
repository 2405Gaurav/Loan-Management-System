import { ROUTES } from "./navigation";
import { isStaffRole, type UserRole } from "./roles";

export interface NavLink {
  label: string;
  href: string;
}

// Center nav links depend on auth context (role)
export function getCenterNavLinks(options: {
  loggedIn: boolean;
  role?: UserRole;
  isStaff?: boolean;
}): NavLink[] {
  const base: NavLink[] = [
    { label: "Home", href: ROUTES.home },
    { label: "FAQ", href: `${ROUTES.home}#faq` },
  ];

  if (!options.loggedIn) return base;

  const staff = options.isStaff ?? isStaffRole(options.role);

  if (staff) {
    base.push({ label: "Dashboard", href: ROUTES.dashboard });
    return base;
  }

  // Borrower: apply via eligibility + track loans on dashboard
  if (options.role === "BORROWER") {
    base.push(
      { label: "Eligibility Check", href: ROUTES.eligibilityCheck },
      { label: "Dashboard", href: ROUTES.dashboard }
    );
  }

  return base;
}
