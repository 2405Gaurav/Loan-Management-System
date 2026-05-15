"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NavbarProfileMenu } from "@/components/layout/navbar-profile-menu";
import { ButtonLink } from "@/components/ui/button";
import { getCenterNavLinks } from "@/lib/nav-links";
import { ROUTES } from "@/lib/navigation";
import {
  selectIsAuthenticated,
  selectIsStaff,
  selectUserRole,
  useAuthStore,
} from "@/stores/auth-store";

export function Navbar() {
  const pathname = usePathname();

  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const role = useAuthStore(selectUserRole);
  const isStaff = useAuthStore(selectIsStaff);

  const navLinks = getCenterNavLinks({
    loggedIn: hasHydrated && isAuthenticated,
    role,
    isStaff,
  });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8">
        <Link href={ROUTES.home} className="text-lg font-semibold text-slate-400">
          <BrandLogo priority className="h-8 w-auto" />
        </Link>

        <nav className="flex items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                pathname === link.href
                  ? "text-brand-600"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          {hasHydrated && isAuthenticated ? (
            <NavbarProfileMenu />
          ) : (
            <>
              <ButtonLink variant="outline" href={ROUTES.signup} className="!rounded-full !px-5 !py-2">
                Sign up
              </ButtonLink>
              <ButtonLink href={ROUTES.login} className="!rounded-full !px-5 !py-2">
                Sign In
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
