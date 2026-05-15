"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPromptModal } from "@/components/eligibility/auth-prompt-modal";
import { Button } from "@/components/ui/button";
import { isLoggedIn } from "@/lib/auth";
import { ROUTES } from "@/lib/navigation";

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

  function handleClick() {
    if (isLoggedIn()) {
      router.push(ROUTES.eligibilityCheck);
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
