export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

// Static FAQ content — easy to move to CMS later
export const generalFaqs: FaqItem[] = [
  {
    id: "what-is-creditsea",
    question: "What is CreditSea?",
    answer:
      "CreditSea is a digital loan platform that helps you apply for personal loans online with a transparent and simple process.",
  },
  {
    id: "how-to-apply",
    question: "How do I apply for a loan?",
    answer:
      "Sign up, complete your profile, run the eligibility check, and submit your application. Our team reviews your details and shares an offer if you qualify.",
  },
  {
    id: "eligibility-criteria",
    question: "What are the basic eligibility criteria?",
    answer:
      "You must be between 23 and 50 years old, earn at least ₹25,000 per month, have a valid PAN, and not be unemployed.",
  },
  {
    id: "documents-needed",
    question: "What documents do I need?",
    answer:
      "Typically a valid PAN, salary proof, and basic personal details. Additional documents may be requested during verification.",
  },
  {
    id: "approval-time",
    question: "How long does approval take?",
    answer:
      "After you submit your profile and pass eligibility checks, our review process is designed to be quick and transparent.",
  },
];
