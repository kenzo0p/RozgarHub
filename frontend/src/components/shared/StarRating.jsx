import React, { useState } from "react";
import { Star } from "lucide-react";

/**
 * Read-only star rating with an optional numeric summary — used on profiles,
 * applicant rows, and review lists. `count` shows how many reviews back it up.
 */
export function StarRatingDisplay({ value = 0, count, size = "sm", showValue = true }) {
  const px = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  const rounded = Math.round(value);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${px} ${
              i <= rounded ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            }`}
            aria-hidden="true"
          />
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-medium text-muted-foreground">
          {value ? Number(value).toFixed(1) : "—"}
          {typeof count === "number" ? ` (${count})` : ""}
        </span>
      )}
    </span>
  );
}

/**
 * Interactive 1–5 star picker for the review form.
 */
export function StarRatingInput({ value, onChange, label = "Rating" }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${i} / 5`}
          aria-pressed={value === i}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              i <= active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
