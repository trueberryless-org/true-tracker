import Task from "./task";

import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    CircleCheck,
    Circle,
    CircleX,
    CircleHelp,
    Timer,
} from "lucide-react";

export type Status = (typeof statuses)[number]["value"];
export type Priority = (typeof priorities)[number]["value"];

export default interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt?: Date;
    lastUpdatedAt?: Date;
    deletedAt?: Date | null;

    status: Status;
    priority: Priority;

    tasks: Task[];
}

export const statuses = [
    {
        value: "backlog",
        label: "Backlog",
        icon: CircleHelp,
    },
    {
        value: "todo",
        label: "Todo",
        icon: Circle,
    },
    {
        value: "in progress",
        label: "In Progress",
        icon: Timer,
    },
    {
        value: "done",
        label: "Done",
        icon: CircleCheck,
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
