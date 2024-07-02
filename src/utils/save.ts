import { User } from "@/models";

const STORAGE_KEY = "timeTrackerData";

export const saveData = (data: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
