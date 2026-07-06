import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "How do I register on RozgarHub?",
    answer:
      "Click the \"Signup\" button at the top right, choose whether you're a worker or an employer, and fill in your details. It takes less than two minutes.",
  },
  {
    question: "How can I find jobs that suit me?",
    answer:
      "Use the search bar to look up jobs by title, trade, or city — or browse by trade from the homepage. Add your skills to your profile and we'll recommend jobs that match them.",
  },
  {
    question: "How do I know if an employer responded?",
    answer:
      "You'll get an in-app notification the moment your application is accepted or reviewed. Everything is tracked on your profile under applied jobs.",
  },
  {
    question: "Is RozgarHub free to use?",
    answer:
      "Yes — completely free for job seekers, with no commissions or hidden charges. Posting jobs is currently free for employers too.",
  },
  {
    question: "What should I do if I face technical issues?",
    answer:
      "Email us at support@rozgarhub.com and we'll get back to you as quickly as we can.",
  },
];

const FAQAccordion = () => {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
        {/* Left intro */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2
            id="faq-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Questions? Answers.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know about finding work on RozgarHub. Still
            stuck? Write to{" "}
            <a
              href="mailto:support@rozgarhub.com"
              className="font-medium text-primary hover:underline"
            >
              support@rozgarhub.com
            </a>
            .
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map(({ question, answer }, index) => (
            <AccordionItem key={question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline">
                {question}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQAccordion;
