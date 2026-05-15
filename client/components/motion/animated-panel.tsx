"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode } from "react";

type Props = {
  show: boolean;
  children: ReactNode;
  className?: string;
};

export function AnimatedPanel({ show, children, className = "" }: Props) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
