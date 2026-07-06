import React from "react";
import { UserPlus, Search, BadgeCheck } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your profile",
    description:
      "Sign up free and list your skills, experience, and the kind of work you want.",
  },
  {
    icon: Search,
    title: "Find matching jobs",
    description:
      "Search by trade or city, or let our recommendations surface jobs that fit your skills.",
  },
  {
    icon: BadgeCheck,
    title: "Apply & get hired",
    description:
      "Apply in one tap and track your application — you're notified the moment an employer responds.",
  },
];

function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="mx-auto max-w-5xl px-4 py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Simple by design
        </p>
        <h2
          id="how-it-works-heading"
          className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          How it works
        </h2>
        <p className="mt-2 text-muted-foreground">
          From signup to your next job in three steps
        </p>
      </div>

      <ol className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
        {/* Connector line between step markers (desktop only) */}
        <div
          aria-hidden="true"
          className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 sm:block"
        />
        {STEPS.map(({ icon: Icon, title, description }, index) => (
          <li key={title} className="relative flex flex-col items-center text-center">
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-background text-primary shadow-sm">
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {index + 1}
              </span>
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default HowItWorks;
