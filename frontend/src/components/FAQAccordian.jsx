import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useI18n } from "@/i18n/I18nProvider";

const FAQ_KEYS = [1, 2, 3, 4, 5];

const FAQAccordion = () => {
  const { t } = useI18n();

  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
        {/* Left intro */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t("faq.eyebrow")}
          </p>
          <h2
            id="faq-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {t("faq.heading")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("faq.intro")}{" "}
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
          {FAQ_KEYS.map((n) => (
            <AccordionItem key={n} value={`faq-${n}`}>
              <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline">
                {t(`faq.q${n}`)}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {t(`faq.a${n}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQAccordion;
