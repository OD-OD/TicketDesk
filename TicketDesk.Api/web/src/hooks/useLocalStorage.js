import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    if (stored === null) return initialValue;

    try {
      // Try to parse as JSON
      return JSON.parse(stored);
    } catch {
      // If parsing fails, the stored value is likely a raw string (e.g., a JWT token)
      // Return it as is.
      return stored;
    }
  });

  useEffect(() => {
    // Always store as JSON string
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}