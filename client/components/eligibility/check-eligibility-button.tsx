"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPromptModal } from "@/components/eligibility/auth-prompt-modal";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/navigation";
import { selectIsAuthenticated, selectIsStaff, useAuthStore } from "@/stores/auth-store";

type ButtonVariant = "primary" | "outline" | "pill" | "pill-outline" | "pill-dark";

type Props = {
  variant?: ButtonVariant;
  className?: string;
};

export function CheckEligibilityButton({
  variant = "outline",
  className = "",
}: Props) {
  const router = useRouter();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isStaff = useAuthStore(selectIsStaff);

  function handleClick() {
    if (isAuthenticated) {
      router.push(isStaff ? ROUTES.dashboard : ROUTES.eligibilityCheck);
      return;
    }
    setShowAuthPrompt(true);
  }

  return (
    <>
      <Button variant={variant} className={className} onClick={handleClick}>
        Check Eligibility
      </Button>
      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
      />
    </>
  );
}
