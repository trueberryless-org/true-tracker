import { ArrowDown, ArrowRight, ArrowUp, Circle, CircleCheck, CircleHelp, CircleX, Timer } from "lucide-react";

import Session from "./session";

export type Status = (typeof statuses)[number]["value"];
export type Priority = (typeof priorities)[number]["value"];

export default interface Task {
    id: string;
    name: string;
    description?: string;

    status: Status;
    priority: Priority;

    sessions: Session[];
}

export interface ExtendedTask extends Task {
    projectName: string;
    projectIsArchived: boolean;
    someSessionIsRunning: boolean;
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
