import Link from "next/link";

export default function Home() {
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
