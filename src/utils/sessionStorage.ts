export const setSessionStorageItem = (key: string, value: any): void => {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }
};

export const getSessionStorageItem = <T>(key: string): T | null => {
  if (typeof window !== "undefined") {
    const storedValue = window.sessionStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null;
  }
  return null;
};

export const removeSessionStorageItem = (key: string): void => {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(key);
  }
};

export const clearSessionStorage = (): void => {
  if (typeof window !== "undefined") {
    window.sessionStorage.clear();
  }
};
