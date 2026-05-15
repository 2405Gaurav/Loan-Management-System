"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/button";
import { getLoginUrl, getSignupUrl, ROUTES } from "@/lib/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AuthPromptModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-prompt-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="auth-prompt-title" className="text-lg font-semibold text-navy">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
