"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BorrowerOnboardingForm } from "@/components/borrower-onboarding-form";
import {
  type BreResponse,
  type BorrowerProfile,
  getBorrowerProfile,
} from "@/lib/api";
import { clearAuth, getStoredUser, isLoggedIn } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [breErrors, setBreErrors] = useState<string[]>([]);
  const [showBreSuccess, setShowBreSuccess] = useState(false);

  // On mount: check JWT and load borrower profile from API
  useEffect(() => {
    async function loadProfile() {
      if (!isLoggedIn()) {
        setLoggedIn(false);
        setLoading(false);
        return;
      }

      setLoggedIn(true);

      try {
        const { user } = await getBorrowerProfile();
        setProfile(user);

        if (user.brePassed) {
          setShowBreSuccess(true);
        }
      } catch (err: unknown) {
        // If token invalid, clear auth and show guest view
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          clearAuth();
          setLoggedIn(false);
        } else {
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
            if (cached.brePassed) setShowBreSuccess(true);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleLogout() {
    clearAuth();
    setLoggedIn(false);
    setProfile(null);
    setBreErrors([]);
    setShowBreSuccess(false);
    router.refresh();
  }

  function handleProfileUpdated(updated: BorrowerProfile, breResult: BreResponse) {
    setProfile(updated);
    setBreErrors(breResult.errors);

    if (breResult.passed) {
      setShowBreSuccess(true);
    } else {
      setShowBreSuccess(false);
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-16">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  // Guest view: not logged in
  if (!loggedIn) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-slate-50 px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">
          Loan Management System
        </h1>
        <p className="max-w-md text-slate-600">
          Sign up or log in to get started.
        </p>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const displayName = profile?.fullName || profile?.email || getStoredUser()?.email;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 bg-slate-50 px-4 py-10">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome{displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="text-sm text-slate-600">
            Complete your borrower profile to check loan eligibility.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Log out
        </button>
      </section>

      {showBreSuccess && profile?.brePassed && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="font-semibold text-emerald-800">Eligibility approved</h2>
          <p className="mt-1 text-sm text-emerald-700">
            You are eligible to continue loan application
          </p>
        </section>
      )}

      {breErrors.length > 0 && !profile?.brePassed && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-800">Eligibility check failed</h2>
          <p className="mt-1 text-sm text-red-700">
            Please fix the following issues and submit again:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-red-700">
            {breErrors.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      )}

      {!profile?.brePassed && (
        <BorrowerOnboardingForm
          initialProfile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </main>
  );
}
