"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Alert, AuthCard, Field } from "@/components/auth-form";
import { saveToken, saveUser, signup } from "@/lib/api";
import { getRedirectTarget, ROUTES } from "@/lib/navigation";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getRedirectTarget(searchParams);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signup(email, password);
      saveToken(data.token);
      saveUser(data.user);
      router.push(redirectTo);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-section-muted px-4 py-16">
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
          <Field
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            required
            minLength={6}
          />

          {error && <Alert type="error" message={error} />}

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
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center p-8">Loading...</main>}>
      <SignupForm />
    </Suspense>
  );
}
