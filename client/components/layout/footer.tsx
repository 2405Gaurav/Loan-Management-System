import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ROUTES } from "@/lib/navigation";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
        <div className="max-w-xs">
          <Link href={ROUTES.home} className="inline-block">
            <BrandLogo className="h-8 w-auto" />
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Digital. Transparent. Prompt.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
          <Link href={ROUTES.home} className="hover:text-slate-900">
            Home
          </Link>
          <Link href={`${ROUTES.home}#faq`} className="hover:text-slate-900">
            FAQ
          </Link>
          <Link href={ROUTES.login} className="hover:text-slate-900">
            Sign In
          </Link>
        </nav>
      </div>
      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
        Built by{" "}
        <Link
          href="https://www.thegauravthakur.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          Gaurav Thakur
        </Link>
      </div>
    </footer>
  );
}
