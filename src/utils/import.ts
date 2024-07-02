import { User } from "@/models";
import { saveData } from "./save";
import { toast } from "@/components/ui/use-toast";

export const importData = (file: File) => {
    return new Promise<User>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = JSON.parse(event.target?.result as string);
                saveData(result);
                toast({
                    title: 'Data imported successfully for username "' + result.username + '".',
                });
                resolve(result);
            } catch (error) {
                console.error("Error importing data", error);
                toast({
                    title: "Error importing data. Please try again.",
                });
                reject(error);
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file", error);
            toast({
                title: "Error reading file. Please try again.",
            });
            reject(error);
        };
        reader.readAsText(file);
    });
};
