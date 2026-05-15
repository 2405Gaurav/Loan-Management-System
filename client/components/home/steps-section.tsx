"use client";

import { motion } from "framer-motion";
import { ScrollReveal, staggerContainer, staggerItem } from "@/components/motion/scroll-reveal";

const steps = [
  {
    title: "Apply Online",
    description:
      "Fill out a quick form with your personal and financial details. No heavy paperwork.",
  },
  {
    title: "Get Express Approval",
    description:
      "We review your details and run eligibility checks to share your loan offer.",
  },
  {
    title: "Receive Funds Promptly",
    description:
      "Once approved, accept the offer and move forward with disbursement.",
  },
];

export function StepsSection() {
  return (
    <section className="bg-section-muted px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl text-center">
        <ScrollReveal>
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">
            3 Easy Steps to Get a Loan
          </h2>
          <p className="mt-2 text-slate-600">Solve your money-related problems</p>
        </ScrollReveal>

        <motion.div
          className="mt-12 grid gap-6 text-left md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {steps.map((step) => (
            <motion.article
              key={step.title}
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
            >
              <h3 className="text-lg font-bold text-navy">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {step.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
