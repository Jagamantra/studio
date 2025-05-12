
import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Effect to load stored value from localStorage on mount (client-side)
  useEffect(() => {
    // Prevent build error "window is undefined"
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) { // Check for null explicitly to distinguish from not found
        setStoredValue(JSON.parse(item) as T);
      }
      // If item is null (not found), storedValue remains initialValue, which is correct.
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      // If error, storedValue remains initialValue.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only re-run if key changes

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      // Prevent build error "window is undefined"
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`
        );
        // Update state for optimistic UI updates if needed, though it won't persist serverside
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        return;
      }

      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes to this local storage value from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        if (event.newValue !== null) {
          try {
            setStoredValue(JSON.parse(event.newValue) as T);
          } catch (error) {
            console.warn(`Error parsing storage change for key “${key}”:`, error);
            setStoredValue(initialValue); // Fallback to initialValue on parse error
          }
        } else {
          // Value was removed or set to null in another tab
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
