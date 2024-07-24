export type AutomationKeys = (typeof automationSettings)[number]["key"];
export type AutomationValueTypes = boolean | string | number;

export default interface Settings {
    theme:
        | "default"
        | "palette"
        | "amethyst"
        | "sapphire"
        | "emerald"
        | "ruby"
        | "coral"
        | "amber"
        | "daylight"
        | "midnight";
    exportReminder: "daily" | "weekly" | "monthly";
    lastExported: Date;

    automation: Record<AutomationKeys, AutomationValueTypes>;
}

export interface AutomationSettings {
    key: string;
    label: string;
    description: string;
    toastActivate: string;
    toastDeactivate: string;
    type: AutomationValueTypes;
    group: string;
}

export const automationSettings: AutomationSettings[] = [
    {
        key: "archiveStopSessions",
        label: "Archive Stop Sessions",
        description: "Automatically stop all running sessions when a project gets archived.",
        toastActivate: "Sessions will now automatically be stopped when the project gets archived.",
        toastDeactivate: "Sessions will no longer automatically be stopped when the project gets archived.",
        type: "boolean",
        group: "Archive",
    },
    {
        key: "archiveProjectStatusRetirement",
        label: "Archive Project Status Retirement",
        description: "Move project status to “Completed” when it gets archived.",
        toastActivate: "Projects will now automatically be marked as “Completed” when they get archived.",
        toastDeactivate: "Projects will no longer automatically be marked as “Completed” when they get archived.",
        type: "boolean",
        group: "Archive",
    },
    {
        key: "archiveTaskStatusRetirement",
        label: "Archive Task Status Retirement",
        description: "Move task status to “Completed” when their project gets archived.",
        toastActivate: "Tasks will now automatically be marked as “Completed” when their project gets archived.",
        toastDeactivate:
            "Tasks will no longer automatically be marked as “Completed” when their project gets archived.",
        type: "boolean",
        group: "Archive",
    },
    {
        key: "projectStatusKickoff",
        label: "Project Status Kickoff",
        description: "Mark projects as “In Progress” when a session is started.",
        toastActivate: "Projects will now automatically be marked as “In Progress” when a session is started.",
        toastDeactivate: "Projects will no longer automatically be marked as “In Progress” when a session is started.",
        type: "boolean",
        group: "Project",
    },
    {
        key: "projectStatusRetirement",
        label: "Project Status Retirement",
        description: "Mark projects as “Completed” when no session has been started for 3 months.",
        toastActivate:
            "Projects will now automatically be marked as “Completed” when no session has been started for 3 months.",
        toastDeactivate:
            "Projects will no longer automatically be marked as “Completed” when no session has been started for 3 months.",
        type: "boolean",
        group: "Project",
    },
    {
        key: "taskStatusKickoff",
        label: "Task Status Kickoff",
        description: "Mark tasks as “In Progress” when a session is started.",
        toastActivate: "Tasks will now automatically be marked as “In Progress” when a session is started.",
        toastDeactivate: "Tasks will no longer automatically be marked as “In Progress” when a session is started.",
        type: "boolean",
        group: "Task",
    },
    {
        key: "taskStatusRetirement",
        label: "Task Status Retirement",
        description: "Mark tasks as “Completed” when no session has been started for one month.",
        toastActivate:
            "Tasks will now automatically be marked as “Completed” when no session has been started for one month.",
        toastDeactivate:
            "Tasks will no longer automatically be marked as “Completed” when no session has been started for one month.",
        type: "boolean",
        group: "Task",
    },
];
