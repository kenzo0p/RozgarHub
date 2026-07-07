import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";

/**
 * Track the app's theme by observing the `dark` class on <html>.
 *
 * The app's dark mode is driven by a custom hook (hooks/useTheme) that
 * toggles that class — NOT by next-themes, which this file previously read.
 * With no next-themes provider mounted, the old code silently fell back to
 * the OS theme, so toasts rendered light-on-dark (or vice versa) whenever
 * the app toggle and the OS preference disagreed.
 *
 * Observing the class directly keeps toasts in sync with whatever code
 * changes the theme, with no shared-state plumbing.
 */
function useDocumentTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

const Toaster = ({ ...props }) => {
  const theme = useDocumentTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      // richColors: success = green, error = red — without it every toast
      // was monochrome and errors were indistinguishable from successes
      richColors
      closeButton
      {...props}
    />
  );
};

export { Toaster };
