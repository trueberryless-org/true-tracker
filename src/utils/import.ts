import { User } from "@/models";
import { saveData } from "./save";
import { toast } from "sonner";
import { sameVersion } from "./versionUtils";
import version from "@/constants/version";
import { initializeUpgradeFunctions } from "./upgradeFunctions";
import { exportData } from "./export";
import { upgradeData } from "./upgradeUtils";
import { useUser } from "@/components/UserContext";

export const importData = (file: File) => {
    return new Promise<User>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                var result = JSON.parse(event.target?.result as string);
                if (!sameVersion(result.version, version)) {
                    initializeUpgradeFunctions();
                    exportData();
                    result.version = { major: 0, minor: 1, patch: 0 };
                    result = upgradeData(result, version);
                    saveData(result);
                    toast("We migrate your data to the latest version.");
                    exportData();
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
