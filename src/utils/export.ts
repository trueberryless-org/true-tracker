import { loadData } from "./load";
import { toast } from "sonner";

export const exportData = () => {
    const data = loadData();
    if (data) {
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "timeTrackerData.json";
            document.body.appendChild(a); // Append anchor to body
            a.click();
            document.body.removeChild(a); // Clean up: remove anchor from body
            URL.revokeObjectURL(url); // Clean up: revoke the URL object
            toast("Data exported successfully.");
        } catch (error) {
            console.error("Error exporting data", error);
            toast("Error exporting data. Please try again.");
        }
    } else {
        console.error("No data to export");
        toast("No data available to export.");
    }
};
