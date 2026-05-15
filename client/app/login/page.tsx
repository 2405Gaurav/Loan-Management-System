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
import { getPostLoginPath, login } from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getRedirectTarget, ROUTES } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";

function LoginForm() {
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
    setLoading(true);

    try {
      const data = await login(email, password);
      setSession(data.token, data.user);
      router.push(getPostLoginPath(data.user, redirectTo));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageEntrance className="flex flex-1">
    <main className="flex flex-1 items-center justify-center bg-section-muted px-4 py-16">
      <AuthCard title="Welcome back" subtitle="Log in to your CreditSea account">
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
            placeholder="Enter your password"
            required
          />

          <AnimatedAuthAlert message={error} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href={`${ROUTES.signup}?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-brand-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </AuthCard>
    </main>
    </PageEntrance>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center p-8">Loading...</main>}>
      <LoginForm />
    </Suspense>
  );
}
