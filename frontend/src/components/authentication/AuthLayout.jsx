import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, User, Briefcase, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const SELLING_POINTS = [
  "Thousands of verified job openings",
  "Zero fees — free for job seekers, forever",
  "Instant notifications when employers respond",
];

/**
 * Two-column auth shell: brand panel on the left (desktop only),
 * form content on the right. Shared by Login and Signup.
 */
export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* ─── Left: brand panel ─────────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Decorative circles */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/5" />

        <Link to="/" className="relative w-fit text-2xl font-extrabold tracking-tight">
          Rozgar<span className="text-white/80">Hub</span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight xl:text-4xl">
            Work that values your skills is one login away.
          </h2>
          <ul className="mt-8 space-y-4">
            {SELLING_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-white/90">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">
          Trusted by workers and employers across India 🇮🇳
        </p>
      </div>

      {/* ─── Right: form column ────────────────────────────────────────── */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        {/* Mobile logo */}
        <Link to="/" className="w-fit text-xl font-extrabold tracking-tight text-foreground lg:hidden">
          Rozgar<span className="text-primary">Hub</span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ROLES = [
  { value: "employee", icon: User, labelKey: "auth.lookingForWork", hintKey: "auth.lookingForWorkSub" },
  { value: "employer", icon: Briefcase, labelKey: "auth.hiring", hintKey: "auth.hiringSub" },
];

/**
 * Segmented role picker — replaces the old unlabeled radio inputs.
 */
export function RoleSelector({ value, onChange }) {
  const { t } = useI18n();
  return (
    <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-3">
      {ROLES.map(({ value: role, icon: Icon, labelKey, hintKey }) => {
        const selected = value === role;
        return (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(role)}
            className={`rounded-xl border p-4 text-left transition-all ${
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`}
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-semibold text-foreground">{t(labelKey)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t(hintKey)}</p>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Password input with visibility toggle.
 */
export function PasswordInput({ id, name, value, onChange, placeholder }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
