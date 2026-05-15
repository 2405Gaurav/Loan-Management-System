"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AuthUser } from "@/lib/api";
import { ROUTES } from "@/lib/navigation";
import type { UserRole } from "@/lib/roles";
import { useAuthStore } from "@/stores/auth-store";

function getInitials(user: AuthUser): string {
  const name = user.fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  const email = user.email?.trim() ?? "";
  if (email.length >= 2) return email.slice(0, 2).toUpperCase();
  return email.slice(0, 1).toUpperCase() || "?";
}

function formatRoleLabel(role?: UserRole): string {
  if (!role) return "Borrower";
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function displayName(user: AuthUser): string {
  if (user.fullName?.trim()) return user.fullName.trim();
  const local = user.email?.split("@")[0] ?? "User";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function NavbarProfileMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!user) return null;

  function handleLogout() {
    setOpen(false);
    clearSession();
    router.push(ROUTES.home);
    router.refresh();
  }

  const initials = getInitials(user);
  const name = displayName(user);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 sm:inline">
          {name}
        </span>
        <svg
          className={`hidden h-4 w-4 text-slate-500 transition-transform sm:block ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            role="menu"
          >
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-base font-semibold text-white">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Role
              </p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">
                {formatRoleLabel(user.role)}
              </p>
            </div>

            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
