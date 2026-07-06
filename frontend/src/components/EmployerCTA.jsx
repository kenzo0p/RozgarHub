import React from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

/**
 * Conversion band for the employer side of the marketplace.
 */
function EmployerCTA() {
  return (
    <section aria-labelledby="employer-cta-heading" className="mx-auto max-w-6xl px-4 py-10">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-700 px-6 py-12 text-center shadow-xl sm:px-12 sm:text-left">
        {/* Decorative circles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-2 h-48 w-48 rounded-full bg-white/5"
        />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/80">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              For employers
            </p>
            <h2
              id="employer-cta-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Hiring skilled workers?
            </h2>
            <p className="mt-2 text-white/85">
              Post jobs free and reach thousands of verified electricians,
              drivers, carpenters, and more — applications land in your
              dashboard, not your inbox.
            </p>
          </div>
          <Link to="/signup" className="shrink-0">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 rounded-full bg-white px-7 font-semibold text-blue-700 hover:bg-white/90"
            >
              Post a job free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default EmployerCTA;
