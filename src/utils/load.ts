import { User } from "@/models";

const STORAGE_KEY = "timeTrackerData";

export const loadData = (): User | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
};
