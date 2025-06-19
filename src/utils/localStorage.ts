export const setLocalStorageItem = (key: string, value: any): void => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

export const getLocalStorageItem = <T>(key: string): T | null => {
  if (typeof window !== "undefined") {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null;
  }
  return null;
};

export const removeLocalStorageItem = (key: string): void => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
};

export const clearLocalStorage = (): void => {
  if (typeof window !== "undefined") {
    window.localStorage.clear();
  }
};
