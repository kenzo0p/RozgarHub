import React from "react";
import { ShieldCheck, HandCoins, BellRing, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const VALUE_PROPS = [
  { icon: ShieldCheck, titleKey: "about.v1Title", descKey: "about.v1Desc" },
  { icon: HandCoins, titleKey: "about.v2Title", descKey: "about.v2Desc" },
  { icon: BellRing, titleKey: "about.v3Title", descKey: "about.v3Desc" },
  { icon: Sparkles, titleKey: "about.v4Title", descKey: "about.v4Desc" },
];

/**
 * "Why RozgarHub" value-props section. Keeps the #about anchor that the
 * navbar and footer scroll-links point to.
 */
function AboutUs() {
  const { t } = useI18n();

  return (
    <section id="about" aria-labelledby="about-heading" className="bg-muted/40 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t("about.eyebrow")}
          </p>
          <h2
            id="about-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {t("about.heading")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("about.subtitle")}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{t(titleKey)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
