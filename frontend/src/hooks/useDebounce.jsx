import { useState, useEffect } from "react";

/**
 * useDebounce — delays updating a value until input settles.
 *
 * Used for search inputs to avoid firing an API call on every keystroke.
 * Instead, waits until the user stops typing for `delay` ms.
 *
 * Performance impact:
 * - Without debounce: 20 keystrokes = 20 API calls
 * - With 300ms debounce: 20 keystrokes = ~1-2 API calls
 *
 * @param value - The raw value to debounce
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel previous timer if value changes before delay expires
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
