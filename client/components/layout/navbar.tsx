"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const role = useAuthStore(selectUserRole);
  const isStaff = useAuthStore(selectIsStaff);

  const navLinks = getCenterNavLinks({
    loggedIn: hasHydrated && isAuthenticated,
    role,
    isStaff,
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const linkClass = (href: string) =>
    `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-brand-50 text-brand-600"
        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} className="shrink-0">
          <BrandLogo priority className="h-7 w-auto sm:h-8" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex lg:gap-8">
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

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {hasHydrated && isAuthenticated ? (
            <NavbarProfileMenu />
          ) : (
            <>
              <ButtonLink
                variant="outline"
                href={ROUTES.signup}
                className="!rounded-full !px-4 !py-2 !text-xs sm:!px-5 sm:!text-sm"
              >
                Sign up
              </ButtonLink>
              <ButtonLink
                href={ROUTES.login}
                className="!rounded-full !px-4 !py-2 !text-xs sm:!px-5 sm:!text-sm"
              >
                Sign In
              </ButtonLink>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          {hasHydrated && isAuthenticated && <NavbarProfileMenu compact />}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {hasHydrated && !isAuthenticated && (
            <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-slate-100 px-4 py-3">
              <ButtonLink variant="outline" href={ROUTES.signup} className="w-full !rounded-full">
                Sign up
              </ButtonLink>
              <ButtonLink href={ROUTES.login} className="w-full !rounded-full">
                Sign In
              </ButtonLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
