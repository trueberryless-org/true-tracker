import { User } from "@/models";

const STORAGE_KEY = "timeTrackerData";

export const saveData = (data: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadData = (): User | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
};
