"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
};

export function FaqItem({ question, answer, isOpen, onToggle }: Props) {
  return (
    <motion.div
      layout
      className="overflow-hidden rounded-md border border-slate-200 bg-white"
      transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span
          className={`text-sm font-semibold sm:text-base ${
            isOpen ? "text-brand-600" : "text-navy"
          }`}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`shrink-0 text-xs ${isOpen ? "text-brand-600" : "text-slate-400"}`}
          aria-hidden
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <p className="text-sm leading-relaxed text-slate-600">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
