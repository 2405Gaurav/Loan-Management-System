import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/navigation";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <Link href={ROUTES.home} className="inline-block">
            <Image src="/logo1.svg" alt="CreditSea" width={180} height={48} />
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            Digital. Transparent. Prompt.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-slate-600">
          <Link href={ROUTES.home} className="hover:text-slate-900">
            Home
          </Link>
          <Link href={`${ROUTES.home}#faq`} className="hover:text-slate-900">
            FAQ
          </Link>
          <Link href={ROUTES.login} className="hover:text-slate-900">
            Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}
