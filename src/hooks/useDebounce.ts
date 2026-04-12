import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the value that only updates after
 * the specified delay (in ms) has elapsed without any new value.
 *
 * Typical usage: debounce a search input before firing a network request.
 *
 * @example
 * const debouncedSearch = useDebounce(searchInput, 400);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
