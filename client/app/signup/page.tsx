"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  AnimatedAuthAlert,
  AuthCard,
  Field,
  PasswordField,
} from "@/components/auth-form";
import { PageEntrance } from "@/components/motion/page-entrance";
import { getPostLoginPath, signup } from "@/lib/api";
import {
  getAuthErrorMessage,
  MIN_PASSWORD_LENGTH,
  validatePasswordClient,
} from "@/lib/auth-errors";
import { getRedirectTarget, ROUTES } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getRedirectTarget(searchParams);
  const setSession = useAuthStore((s) => s.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const passwordError = validatePasswordClient(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const data = await signup(email, password);
      setSession(data.token, data.user);
      router.push(getPostLoginPath(data.user, redirectTo));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageEntrance className="flex flex-1">
    <main className="flex flex-1 items-center justify-center bg-section-muted px-4 py-10 sm:py-16">
      <AuthCard title="Create account" subtitle="Join CreditSea in a few steps">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <PasswordField
            label="Password"
            id="password"
            value={password}
            onChange={setPassword}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />

          <AnimatedAuthAlert message={error} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={`${ROUTES.login}?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-brand-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </AuthCard>
    </main>
    </PageEntrance>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center p-8">Loading...</main>}>
      <SignupForm />
    </Suspense>
  );
}
