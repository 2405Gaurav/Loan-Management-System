"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { LiveSyncBadge } from "@/components/dashboard/live-sync-badge";
import { BorrowerLoanOverview } from "@/components/borrower/borrower-loan-overview";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
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
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [activeLoan, setActiveLoan] = useState<LoanApplication | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    else setSyncing(true);
    if (!opts?.silent) setError("");
    try {
      const data = await getBorrowerProfile();
      setProfile(data.user);
      setActiveLoan(data.activeLoan);
      updateUser(data.user);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (!opts?.silent) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : "Failed to load your loan status";
        setError(message);
      }
    } finally {
      if (!opts?.silent) setLoading(false);
      else setSyncing(false);
    }
  }, [updateUser]);

  useEffect(() => {
    void load();
  }, [load]);

  useLiveRefresh(() => load({ silent: true }));

  const displayName = profile?.fullName || user?.fullName || user?.email;

  if (loading) {
    return <p className="text-sm text-slate-500">Loading your applications...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome{displayName ? `, ${displayName}` : ""}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Track your loan application status here. To apply or update details, use Eligibility
            Check.
          </p>
        </div>
        <LiveSyncBadge lastUpdated={lastUpdated} syncing={syncing} />
      </div>

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
