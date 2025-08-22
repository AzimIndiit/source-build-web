import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook that returns a debounced version of the provided callback function
 * @param func - The original, non-debounced function
 * @param delay - Delay in milliseconds (default: 1000)
 * @returns Debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 1000
): (...args: Parameters<T>) => void {
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer
      timerRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );

  return debouncedFunction;
}

// Alias for backwards compatibility
export const useDebounce = useDebouncedCallback;
