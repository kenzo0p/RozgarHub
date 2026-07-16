import React from "react";

/**
 * The RozgarHub hub mark: a worker at the center, jobs within reach around
 * them; the amber node on the thickest spoke is the match, made directly —
 * no middleman. Blue parts inherit `currentColor` so the mark follows its
 * context (text-primary on app surfaces, text-white on the auth brand panel);
 * the amber accent stays fixed.
 */
export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeLinecap="round">
        <line x1="120" y1="120" x2="194" y2="120" strokeWidth="16" />
        <line x1="120" y1="120" x2="83" y2="56" strokeWidth="16" />
        <line x1="120" y1="120" x2="46" y2="120" strokeWidth="16" />
        <line x1="120" y1="120" x2="83" y2="184" strokeWidth="16" />
        <line x1="120" y1="120" x2="157" y2="184" strokeWidth="16" />
        <line x1="120" y1="120" x2="157" y2="56" strokeWidth="20" />
      </g>
      <g fill="currentColor">
        <circle cx="194" cy="120" r="17" />
        <circle cx="83" cy="56" r="17" />
        <circle cx="46" cy="120" r="17" />
        <circle cx="83" cy="184" r="17" />
        <circle cx="157" cy="184" r="17" />
      </g>
      <circle cx="157" cy="56" r="23" fill="#F59E0B" />
      <circle cx="120" cy="120" r="36" fill="currentColor" />
    </svg>
  );
}

export default LogoMark;
