import { useState, useCallback } from "react";

/**
 * useLocalStorage — persists state across page refreshes.
 *
 * Wraps useState with localStorage read/write.
 * Handles SSR (no window), JSON serialization, and storage errors.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
function useLocalStorage(key, initialValue) {
  // Lazy initialization: read from localStorage on first render only
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Write to localStorage whenever the value changes
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function (same API as useState)
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Failed to save to localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
