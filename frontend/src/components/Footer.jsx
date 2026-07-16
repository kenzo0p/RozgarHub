import React from "react";
import { Link } from "react-router-dom";
import { Link as LinkScroll } from "react-scroll";
import { Linkedin, Twitter, Facebook, Mail } from "lucide-react";
import LogoMark from "./shared/Logo";

/* Only destinations that actually exist in the app — a footer full of
   dead links erodes trust faster than a short one. */
const LINK_GROUPS = [
  {
    heading: "For workers",
    links: [
      { label: "Find jobs", to: "/jobs" },
      { label: "Browse by trade", to: "/jobs" },
      { label: "My profile", to: "/profile" },
    ],
  },
  {
    heading: "For employers",
    links: [
      { label: "Post a job", to: "/signup" },
      { label: "Manage companies", to: "/admin/companies" },
      { label: "View applicants", to: "/admin/jobs" },
    ],
  },
];

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: Linkedin },
  { label: "Twitter", href: "https://www.twitter.com", icon: Twitter },
  { label: "Facebook", href: "https://www.facebook.com", icon: Facebook },
];

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="flex w-fit items-center gap-2">
              <LogoMark className="h-8 w-8 text-primary" />
              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                Rozgar<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Connecting India&apos;s skilled workers with verified employers —
              no middlemen, no fees.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
              <a
                href="mailto:support@rozgarhub.com"
                aria-label="Email support"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {LINK_GROUPS.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="transition-colors hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Platform column (scroll anchors on the landing page) */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Platform</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <LinkScroll
                  to="about"
                  smooth={true}
                  duration={500}
                  offset={-64}
                  className="cursor-pointer transition-colors hover:text-primary"
                >
                  Why RozgarHub
                </LinkScroll>
              </li>
              <li>
                <LinkScroll
                  to="faq"
                  smooth={true}
                  duration={500}
                  offset={-64}
                  className="cursor-pointer transition-colors hover:text-primary"
                >
                  FAQ
                </LinkScroll>
              </li>
              <li>
                <a
                  href="mailto:support@rozgarhub.com"
                  className="transition-colors hover:text-primary"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} RozgarHub. All rights reserved.</p>
          <p>Made in India, for India&apos;s workforce 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
