"use client";

import { ButtonLink } from "@/components/ui/button";
import { getLoginUrl, getSignupUrl, ROUTES } from "@/lib/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

// Shown when guest clicks "Check Eligibility" — prompts login or signup
export function AuthPromptModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-brand-100 bg-white p-6 shadow-xl">
        <h2 id="auth-prompt-title" className="text-lg font-semibold text-slate-900">
          Sign in to check eligibility
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Please log in or create an account to continue with your eligibility check.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={getLoginUrl(ROUTES.eligibilityCheck)} className="flex-1">
            Sign In
          </ButtonLink>
          <ButtonLink
            variant="outline"
            href={getSignupUrl(ROUTES.eligibilityCheck)}
            className="flex-1"
          >
            Sign up
          </ButtonLink>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
