import Project from "./project";

export default interface User {
    username: string;
    projects: Project[];

    profilePicture?: string | null;

    lastExported: Date;
    exportReminder: "daily" | "weekly" | "monthly";

    theme?: "default" | "palette" | "sapphire" | "ruby" | "emerald" | "daylight" | "midnight";
}
