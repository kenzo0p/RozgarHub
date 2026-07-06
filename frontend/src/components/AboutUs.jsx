import React from "react";
import { ShieldCheck, HandCoins, BellRing, Sparkles } from "lucide-react";

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Verified employers",
    description:
      "Every company on RozgarHub is registered and accountable — no fake postings, no surprises.",
  },
  {
    icon: HandCoins,
    title: "Zero fees, ever",
    description:
      "Finding work should never cost money. No commissions, no middlemen, no hidden charges.",
  },
  {
    icon: BellRing,
    title: "Instant updates",
    description:
      "Get notified the moment an employer views or responds to your application.",
  },
  {
    icon: Sparkles,
    title: "Skill-matched jobs",
    description:
      "Our recommendations learn your trade and surface the openings that actually fit you.",
  },
];

/**
 * "Why RozgarHub" value-props section. Keeps the #about anchor that the
 * navbar and footer scroll-links point to.
 */
function AboutUs() {
  return (
    <section id="about" aria-labelledby="about-heading" className="bg-muted/40 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Why RozgarHub
          </p>
          <h2
            id="about-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Built for India&apos;s skilled workforce
          </h2>
          <p className="mt-3 text-muted-foreground">
            We bridge the gap between employers and blue-collar workers with a
            platform that&apos;s fair, fast, and free for job seekers.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutUs;
