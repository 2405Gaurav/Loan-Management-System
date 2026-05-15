"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useMountEntrance } from "@/hooks/use-mount-entrance";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Props = {
  children: ReactNode;
  className?: string;
};

/** Subtle fade-up on every page mount and route change. */
export function PageEntrance({ children, className = "" }: Props) {
  const pathname = usePathname();
  const ready = useMountEntrance();

  if (!ready) {
    return <div className={className} aria-hidden />;
  }

  return (
    <motion.div
      key={pathname}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
    >
      {children}
    </motion.div>
  );
}
