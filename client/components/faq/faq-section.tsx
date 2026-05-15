"use client";

import { useState } from "react";
import { FaqItem } from "@/components/faq/faq-item";
import { generalFaqs } from "@/components/faq/faq-data";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(
    generalFaqs.find((f) => f.id === "how-to-apply")?.id ?? generalFaqs[0]?.id ?? null
  );

  function handleToggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <section id="faq" className="scroll-mt-20 bg-faq-dark px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-slate-400 sm:text-3xl">
          Frequently Asked Questions
        </h2>

        <p className="mt-10 text-sm font-bold text-white">General Questions</p>

        <div className="mt-4 space-y-3">
          {generalFaqs.map((faq) => (
            <FaqItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              isOpen={openId === faq.id}
              onToggle={() => handleToggle(faq.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
