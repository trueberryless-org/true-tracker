import { loadData } from "@/utils/load";
import TimeSpan from "./timespan";

import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

export type Priority = (typeof priorities)[number]["value"];

export default interface Task {
    id: string;
    name: string;
    description?: string;
    priority: Priority;
    timeSpans: TimeSpan[];
}

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

export const getProjectValue = (task: Task) => {
    const user = loadData();
    const projects = user?.projects || [];
    const project = projects.find((project) => project.tasks.some((t: Task) => t.id === task.id));
    return project ? project.name : "Unknown";
};

export const calculateTotalTime = (task: Task): number => {
    return task.timeSpans.reduce((total, timeSpan) => {
        if (timeSpan.end !== null) {
            const start = Date.parse(String(timeSpan.start));
            const end = Date.parse(String(timeSpan.end));
            return total + (end - start);
        }
        return total;
    }, 0);
};

export const msToTime = (duration: number) => {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    // Initialize an array to store non-zero time components
    let timeComponents: string[] = [];

    if (hours > 0) {
        timeComponents.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    }
    if (minutes > 0) {
        timeComponents.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    }
    if (seconds > 0 || timeComponents.length === 0) {
        timeComponents.push(`${seconds} second${seconds > 1 ? "s" : ""}`);
    }

    // Join time components with commas and return as a single string
    return timeComponents.join(", ");
};
