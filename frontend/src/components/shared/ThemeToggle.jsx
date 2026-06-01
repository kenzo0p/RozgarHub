import { Sun, Moon } from "lucide-react";
import { Button } from "../ui/button";
import useTheme from "../../hooks/useTheme";

/**
 * ThemeToggle — sun/moon button for dark mode switching.
 * Smooth icon transition with rotation animation.
 */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-full"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun
        className={`h-4 w-4 transition-all duration-300 ${
          isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
      />
    </Button>
  );
}

export default ThemeToggle;
