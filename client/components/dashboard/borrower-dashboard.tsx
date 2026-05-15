"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { BorrowerLoanOverview } from "@/components/borrower/borrower-loan-overview";
import { ButtonLink } from "@/components/ui/button";
import {
  getBorrowerProfile,
  type LoanApplication,
  type BorrowerProfile,
} from "@/lib/api";
import { ROUTES } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function BorrowerDashboard() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [activeLoan, setActiveLoan] = useState<LoanApplication | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getBorrowerProfile();
      setProfile(data.user);
      setActiveLoan(data.activeLoan);
      updateUser(data.user);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Failed to load your loan status";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    load();
  }, [load]);

  const displayName = profile?.fullName || user?.fullName || user?.email;

  if (loading) {
    return <p className="text-sm text-slate-500">Loading your applications...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">
        Welcome{displayName ? `, ${displayName}` : ""}
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Track your loan application status here. To apply or update details, use Eligibility Check.
      </p>

      {!activeLoan ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">You have not applied for a loan yet.</p>
          <ButtonLink href={ROUTES.eligibilityCheck} className="mt-4 inline-flex">
            Start eligibility check
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8">
          <BorrowerLoanOverview loan={activeLoan} />
        </div>
      )}

      {profile && !profile.brePassed && !activeLoan && (
        <p className="mt-4 text-sm text-amber-700">
          Complete personal details and pass eligibility on the{" "}
          <Link href={ROUTES.eligibilityCheck} className="font-medium text-brand-600 hover:underline">
            Eligibility Check
          </Link>{" "}
          page.
        </p>
      )}
    </section>
  );
}
