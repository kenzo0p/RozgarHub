import { useEffect, useCallback } from "react";
import useLocalStorage from "./useLocalStorage";

/**
 * useTheme — dark mode toggle with system preference detection.
 *
 * Priority order:
 * 1. User's explicit choice (saved in localStorage)
 * 2. System preference (prefers-color-scheme media query)
 * 3. Default: light
 *
 * How it works:
 * - Adds/removes the 'dark' class on <html> element
 * - shadcn/ui and Tailwind's dark: prefix automatically picks it up
 * - The CSS variables in index.css switch between light/dark palettes
 *
 * Usage:
 *   const { theme, toggleTheme, isDark } = useTheme();
 */
function useTheme() {
  const [theme, setTheme] = useLocalStorage("rozgarhub-theme", () => {
    // Detect system preference on first visit
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const isDark = theme === "dark";

  return { theme, setTheme, toggleTheme, isDark };
}

export default useTheme;
