import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ROUTES } from "@/lib/navigation";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <Link href={ROUTES.home} className="inline-block">
            <BrandLogo className="h-8 w-auto" />
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            Digital. Transparent. Prompt.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-slate-600">
          <Link href={ROUTES.home} className="hover:text-slate-900">Home</Link>
          <Link href={`${ROUTES.home}#faq`} className="hover:text-slate-900">FAQ</Link>
          <Link href={ROUTES.login} className="hover:text-slate-900">Sign In</Link>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        {"Built by "}
        <Link href="https://www.thegauravthakur.in/" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-500 hover:text-slate-800 transition-colors">
          Gaurav Thakur
        </Link>
      </div>
    </footer>
  );
}