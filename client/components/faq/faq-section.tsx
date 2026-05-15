"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { FaqItem } from "@/components/faq/faq-item";
import { generalFaqs } from "@/components/faq/faq-data";
import { ScrollReveal, staggerContainer, staggerItem } from "@/components/motion/scroll-reveal";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(
    generalFaqs[0]?.id ?? null
  );

  function handleToggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <section id="faq" className="scroll-mt-20 bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h2 className="text-center text-2xl font-bold text-navy sm:text-3xl">
            Frequently Asked Questions
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mt-10 text-sm font-bold text-brand-600">General Questions</p>
        </ScrollReveal>

        <motion.div
          className="mt-4 space-y-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {generalFaqs.map((faq) => (
            <motion.div key={faq.id} variants={staggerItem}>
              <FaqItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openId === faq.id}
                onToggle={() => handleToggle(faq.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
