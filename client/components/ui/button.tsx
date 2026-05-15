import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "outline" | "pill" | "pill-outline" | "pill-dark";

type BaseProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkButtonProps = BaseProps & {
  href: string;
};

const variantStyles: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 border border-transparent",
  outline: "bg-white text-brand-600 border border-brand-600 hover:bg-brand-50",
  pill: "rounded-full bg-white text-slate-900 shadow-md hover:bg-slate-50 border border-slate-200",
  "pill-outline":
    "rounded-full bg-transparent text-white border border-white/80 hover:bg-white/10",
  "pill-dark":
    "rounded-full bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-sm",
};

const baseStyles =
  "inline-flex items-center justify-center px-8 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  children,
  className = "",
  href,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
