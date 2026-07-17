import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, User, Briefcase, Home, Building2, Eye, EyeOff } from "lucide-react";
import LogoMark from "../shared/Logo";
import { useI18n } from "@/i18n/I18nProvider";

const SELLING_POINT_KEYS = ["brand.point1", "brand.point2", "brand.point3"];

/**
 * Two-column auth shell: brand panel on the left (desktop only),
 * form content on the right. Shared by Login and Signup.
 */
export function AuthLayout({ title, subtitle, children }) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* ─── Left: brand panel ─────────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Decorative circles */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-white/5" />

        <Link to="/" className="relative flex w-fit items-center gap-2 text-2xl font-extrabold tracking-tight">
          <LogoMark className="h-8 w-8 text-white" />
          <span>
            Rozgar<span className="text-white/80">Hub</span>
          </span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight xl:text-4xl">
            {t("brand.headline")}
          </h2>
          <ul className="mt-8 space-y-4">
            {SELLING_POINT_KEYS.map((pointKey) => (
              <li key={pointKey} className="flex items-start gap-3 text-white/90">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                {t(pointKey)}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/70">{t("brand.trusted")}</p>
      </div>

      {/* ─── Right: form column ────────────────────────────────────────── */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        {/* Mobile logo */}
        <Link to="/" className="flex w-fit items-center gap-2 text-xl font-extrabold tracking-tight text-foreground lg:hidden">
          <LogoMark className="h-7 w-7 text-primary" />
          <span>
            Rozgar<span className="text-primary">Hub</span>
          </span>
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

const EMPLOYER_TYPES = [
  { value: "individual", icon: Home, labelKey: "auth.hiringIndividual", hintKey: "auth.hiringIndividualSub" },
  { value: "business", icon: Building2, labelKey: "auth.hiringBusiness", hintKey: "auth.hiringBusinessSub" },
];

/**
 * Sub-picker shown once "Hiring" is chosen: an individual (hiring for
 * themselves, e.g. a driver for their car) or a registered business.
 */
export function EmployerTypeSelector({ value, onChange }) {
  const { t } = useI18n();
  return (
    <div role="radiogroup" aria-label="Employer type" className="grid grid-cols-2 gap-3">
      {EMPLOYER_TYPES.map(({ value: type, icon: Icon, labelKey, hintKey }) => {
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(type)}
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
  const { t } = useI18n();
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
        aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
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
