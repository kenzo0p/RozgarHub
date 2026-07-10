import React from "react";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Trust badge shown next to a company. "Verified" means the employer
 * submitted a GST number; anything else warns the worker to be cautious.
 *
 * @param {string} status - company verificationStatus
 * @param {boolean} [showUnverified] - render a subtle warning when not verified
 */
function VerifiedBadge({ status, showUnverified = false }) {
  const { t } = useI18n();

  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {t("card.verified")}
      </span>
    );
  }

  if (showUnverified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
        {t("card.unverified")}
      </span>
    );
  }

  return null;
}

export default VerifiedBadge;
