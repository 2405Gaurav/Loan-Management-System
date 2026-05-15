"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { clearAuth, getStoredUser, isLoggedIn } from "@/lib/auth";
import { ROUTES } from "@/lib/navigation";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: ROUTES.home },
  { label: "FAQ", href: `${ROUTES.home}#faq` },
  { label: "Eligibility Check", href: `${ROUTES.eligibilityCheck}` },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
    setUserEmail(getStoredUser()?.email ?? "");
  }, [pathname]);

  function handleLogout() {
    clearAuth();
    setLoggedIn(false);
    setUserEmail("");
    router.push(ROUTES.home);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8">
        <Link href={ROUTES.home} className="text-lg font-semibold text-slate-400">
        <Image src="/logo1.svg" alt="CreditSea" width={180} height={200} />
        </Link>

        <nav className="flex items-center justify-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          {mounted && loggedIn ? (
            <>
              <span className="hidden max-w-[160px] truncate text-sm text-slate-600 sm:inline">
                {userEmail}
              </span>
              <Button variant="pill-dark" onClick={handleLogout} className="!px-5 !py-2">
                Log out
              </Button>
            </>
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