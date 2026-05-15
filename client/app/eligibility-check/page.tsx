"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BorrowerOnboardingForm } from "@/components/borrower-onboarding-form";
import { PageBanner } from "@/components/layout/page-banner";
import { AnimatedPanel } from "@/components/motion/animated-panel";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import {
  type BreResponse,
  type BorrowerProfile,
  getBorrowerProfile,
} from "@/lib/api";
import { getStoredUser, isLoggedIn } from "@/lib/auth";
import { getLoginUrl, ROUTES } from "@/lib/navigation";

export default function EligibilityCheckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [breErrors, setBreErrors] = useState<string[]>([]);
  const [showBreSuccess, setShowBreSuccess] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(getLoginUrl(ROUTES.eligibilityCheck));
      return;
    }

    async function loadProfile() {
      try {
        const { user } = await getBorrowerProfile();
        setProfile(user);
        if (user.brePassed) setShowBreSuccess(true);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.replace(getLoginUrl(ROUTES.eligibilityCheck));
          return;
        }
        const cached = getStoredUser();
        if (cached) {
          setProfile({
            id: cached.id,
            email: cached.email,
            fullName: cached.fullName ?? "",
            panNumber: "",
            dateOfBirth: "",
            monthlySalary: 0,
            employmentType: "",
            profileCompleted: cached.profileCompleted ?? false,
            brePassed: cached.brePassed ?? false,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function handleProfileUpdated(updated: BorrowerProfile, breResult: BreResponse) {
    setProfile(updated);
    setBreErrors(breResult.errors);
    setShowBreSuccess(breResult.passed);
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-white py-20">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  const displayName = profile?.fullName || profile?.email || getStoredUser()?.email;

  return (
    <>
      <PageBanner
        label="Eligibility Check"
        title={`Welcome${displayName ? `, ${displayName}` : ""}`}
        description="Complete your personal details to run our Business Rule Engine (BRE)."
      />

      <main className="bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <AnimatedPanel show={showBreSuccess && !!profile?.brePassed}>
            <section className="rounded-md border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="font-semibold text-emerald-800">Eligibility approved</h2>
              <p className="mt-1 text-sm text-emerald-700">
                You are eligible to continue loan application
              </p>
            </section>
          </AnimatedPanel>

          <AnimatedPanel show={breErrors.length > 0 && !profile?.brePassed}>
            <section className="rounded-md border border-red-200 bg-red-50 p-6">
              <h2 className="font-semibold text-red-800">Eligibility check failed</h2>
              <p className="mt-1 text-sm text-red-700">
                Please fix the following and submit again:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-red-700">
                {breErrors.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </section>
          </AnimatedPanel>

          <ScrollReveal delay={0.1}>
            {!profile?.brePassed ? (
              <BorrowerOnboardingForm
                initialProfile={profile}
                onProfileUpdated={handleProfileUpdated}
              />
            ) : (
              <section className="rounded-md border border-slate-200 bg-white p-8 text-center">
                <p className="text-slate-600">Your profile is complete and eligible.</p>
              </section>
            )}
          </ScrollReveal>
        </div>
      </main>
    </>
  );
}
