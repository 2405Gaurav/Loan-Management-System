"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useFirstSession } from "@/hooks/use-first-session";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Props = {
  children: ReactNode;
  className?: string;
};

/** Subtle fade-up on the first visit to each route in the current browser session. */
export function PageEntrance({ children, className = "" }: Props) {
  const pathname = usePathname();
  const launch = useFirstSession(`page-entered-${pathname}`);
  const playIntro = launch === "first";

  if (launch === "pending") {
    return <div className={className} aria-busy="true" />;
  }

  return (
    <motion.div
      className={className}
      initial={playIntro ? { opacity: 0, y: 16 } : false}
      animate={playIntro ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.45, ease }}
    >
      {children}
    </motion.div>
  );
}
