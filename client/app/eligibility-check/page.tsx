"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BorrowerOnboardingForm } from "@/components/borrower-onboarding-form";
import { LoanConfigForm } from "@/components/borrower/loan-config-form";
import { LoanSummaryCard } from "@/components/borrower/loan-summary-card";
import { SalarySlipUpload } from "@/components/borrower/salary-slip-upload";
import { PageBanner } from "@/components/layout/page-banner";
import { AnimatedPanel } from "@/components/motion/animated-panel";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import {
  type BreResponse,
  type BorrowerProfile,
  type LoanApplication,
  type SalarySlipDocument,
  getBorrowerProfile,
} from "@/lib/api";
import { getLoginUrl, ROUTES } from "@/lib/navigation";
import {
  selectIsAuthenticated,
  selectIsBorrower,
  selectIsStaff,
  useAuthStore,
} from "@/stores/auth-store";

export default function EligibilityCheckPage() {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isBorrower = useAuthStore(selectIsBorrower);
  const isStaff = useAuthStore(selectIsStaff);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const fetchSession = useAuthStore((s) => s.fetchSession);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [activeLoan, setActiveLoan] = useState<LoanApplication | null>(null);
  const [breErrors, setBreErrors] = useState<string[]>([]);
  const [uploadedDoc, setUploadedDoc] = useState<SalarySlipDocument | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getBorrowerProfile();
      setProfile(data.user);
      setActiveLoan(data.activeLoan);
      updateUser(data.user);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          router.replace(getLoginUrl(ROUTES.eligibilityCheck));
          return;
        }
        if (err.response?.status === 403) {
          router.replace(ROUTES.dashboard);
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [router, updateUser]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace(getLoginUrl(ROUTES.eligibilityCheck));
      return;
    }

    async function init() {
      await fetchSession();

      if (selectIsStaff(useAuthStore.getState())) {
        router.replace(ROUTES.dashboard);
        return;
      }

      if (!selectIsBorrower(useAuthStore.getState())) {
        router.replace(ROUTES.login);
        return;
      }

      await loadProfile();
    }

    init();
  }, [hasHydrated, isAuthenticated, fetchSession, router, loadProfile]);

  function handleProfileUpdated(updated: BorrowerProfile, breResult: BreResponse) {
    setProfile(updated);
    setBreErrors(breResult.errors);
    setActiveLoan(breResult.activeLoan);
    updateUser(updated);
  }

  function handleSalarySlipUploaded(doc: SalarySlipDocument) {
    setUploadedDoc(doc);
    if (profile) {
      const next = { ...profile, salarySlipUploaded: true };
      setProfile(next);
      updateUser(next);
    }
  }

  function handleLoanApplied(loan: LoanApplication) {
    setActiveLoan(loan);
  }

  if (!hasHydrated || loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-white py-20">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  if (!isBorrower || isStaff) return null;

  const displayName = profile?.fullName || profile?.email || user?.email;
  const hasActiveLoan = Boolean(activeLoan);
  const brePassed = Boolean(profile?.brePassed);
  const salaryUploaded = Boolean(profile?.salarySlipUploaded || uploadedDoc);

  return (
    <>
      <PageBanner
        label="Borrower Application"
        title={`Welcome${displayName ? `, ${displayName}` : ""}`}
        description="Complete each step to submit your loan application."
      />

      <main className="bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {hasActiveLoan && activeLoan && (
            <ScrollReveal>
              <LoanSummaryCard loan={activeLoan} />
            </ScrollReveal>
          )}

          {!hasActiveLoan && (
            <>
              <AnimatedPanel show={brePassed}>
                <section className="rounded-md border border-emerald-200 bg-emerald-50 p-5">
                  <h2 className="font-semibold text-emerald-800">Eligibility approved</h2>
                  <p className="mt-1 text-sm text-emerald-700">
                    You are eligible to continue loan application
                  </p>
                </section>
              </AnimatedPanel>

              <AnimatedPanel show={breErrors.length > 0 && !brePassed}>
                <section className="rounded-md border border-red-200 bg-red-50 p-5">
                  <h2 className="font-semibold text-red-800">Eligibility check failed</h2>
                  <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-red-700">
                    {breErrors.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </section>
              </AnimatedPanel>

              {!brePassed && (
                <ScrollReveal delay={0.05}>
                  <BorrowerOnboardingForm
                    initialProfile={profile}
                    onProfileUpdated={handleProfileUpdated}
                  />
                </ScrollReveal>
              )}

              {brePassed && !salaryUploaded && (
                <ScrollReveal delay={0.1}>
                  <SalarySlipUpload onUploaded={handleSalarySlipUploaded} />
                </ScrollReveal>
              )}

              {brePassed && salaryUploaded && (
                <ScrollReveal delay={0.1}>
                  {uploadedDoc && (
                    <p className="mb-4 rounded-md border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                      Uploaded: {uploadedDoc.originalFileName}
                    </p>
                  )}
                  <LoanConfigForm onApplied={handleLoanApplied} />
                </ScrollReveal>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
