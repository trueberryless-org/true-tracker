import { User } from "@/models";
import { saveData } from "./save";
import { toast } from "sonner";

export const importData = (file: File) => {
    return new Promise<User>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = JSON.parse(event.target?.result as string);
                if (!result.lastExported) {
                    result.lastExported = new Date();
                }
                if (!result.exportReminder) {
                    result.exportReminder = "weekly";
                }
                saveData(result);
                toast('Data imported successfully for username "' + result.username + '".');
                resolve(result);
            } catch (error) {
                console.error("Error importing data", error);
                toast("Error importing data. Please try again.");
                reject(error);
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file", error);
            toast("Error reading file. Please try again.");
            reject(error);
        };
        reader.readAsText(file);
    });
};
