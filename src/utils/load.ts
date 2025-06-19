import STORAGE_KEY from "@/constants/storageKey";
import { User } from "@/models";

export const loadData = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};
