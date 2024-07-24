import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Circle,
    CircleCheck,
    CircleDashed,
    CircleDotDashed,
    CircleHelp,
    CirclePause,
    CircleX,
    Timer,
} from "lucide-react";

import Task from "./task";

export type Status = (typeof statuses)[number]["value"];
export type Priority = (typeof priorities)[number]["value"];

export default interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt?: Date;
    lastUpdatedAt?: Date;
    archivedAt?: Date | null;

    status: Status;
    priority: Priority;

    tasks: Task[];
}

export interface ExtendedProject extends Project {
    projectIsArchived: boolean;
    mostRecentDate: Date | null;
    someSessionIsRunning: boolean;
}

export const statuses = [
    {
        value: "planned",
        label: "Planned",
        icon: Circle,
    },
    {
        value: "in progress",
        label: "In Progress",
        icon: Timer,
    },
    {
        value: "in review",
        label: "In Review",
        icon: CircleDotDashed,
    },
    {
        value: "completed",
        label: "Completed",
        icon: CircleCheck,
    },
    {
        value: "on hold",
        label: "On Hold",
        icon: CirclePause,
    },
    {
        value: "canceled",
        label: "Canceled",
        icon: CircleX,
    },
];

export const priorities = [
    {
        value: "low",
        label: "Low",
        icon: ArrowDown,
    },
    {
        value: "medium",
        label: "Medium",
        icon: ArrowRight,
    },
    {
        value: "high",
        label: "High",
        icon: ArrowUp,
    },
];
