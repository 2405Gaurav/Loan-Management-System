import { FaqSection } from "@/components/faq/faq-section";
import { Hero } from "@/components/home/hero";
import { StepsSection } from "@/components/home/steps-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StepsSection />
      <FaqSection />
    </>
  );
}
