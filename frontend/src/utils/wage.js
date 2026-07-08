/**
 * Format a job's pay for display.
 *
 * Blue-collar work is paid by the day/hour/month far more often than
 * annually, so a bare "3.4 LPA" is meaningless to most users. This turns
 * an amount + wageType into a readable Indian-format string like
 * "₹18,000/month" or "₹600/day".
 *
 * Legacy jobs created before wageType existed have no wageType and store
 * salary as LPA (a small number like 3.4) — those fall back to "X LPA".
 */

const PERIOD_LABEL = {
  hourly: "/hr",
  daily: "/day",
  weekly: "/week",
  monthly: "/month",
  fixed: " fixed",
};

/** Group a number in the Indian numbering system (e.g. 18000 → "18,000"). */
function inr(amount) {
  return Number(amount).toLocaleString("en-IN");
}

/**
 * @param {number} salary - the pay amount
 * @param {string} [wageType] - hourly | daily | weekly | monthly | yearly | fixed
 * @returns {string}
 */
export function formatWage(salary, wageType) {
  if (salary === undefined || salary === null || salary === "") return "—";

  // Legacy / yearly data stored as LPA (small numbers)
  if (!wageType || wageType === "yearly") {
    return `₹${inr(salary)} LPA`;
  }

  const suffix = PERIOD_LABEL[wageType] ?? `/${wageType}`;
  return `₹${inr(salary)}${suffix}`;
}

/** Short label for a wage type, e.g. for filter dropdowns. */
export const WAGE_TYPE_OPTIONS = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily wage" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "fixed", label: "Fixed / per job" },
];
