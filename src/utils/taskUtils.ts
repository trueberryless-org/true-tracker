import { Project, Task, User } from "@/models";
import { loadData } from "./load";

export const initializeTask = (): Task => {
    return {
        id: crypto.randomUUID(),
        name: "New Task",
        status: "backlog",
        priority: "medium",
        sessions: [],
    };
};

export const getMostRecentSessionDate = (task: Task) => {
    const dates = task.sessions.map((session) => new Date(session.end ?? session.start).getTime());
    return new Date(Math.max(...dates));
};

export const getProjectValue = (task: Task): string => {
    const user = loadData();
    const projects = user?.projects || [];
    const project = projects.find((project) => project.tasks.some((t: Task) => t.id === task.id));
    return project ? project.name : "Unknown";
};

export const getProject = (task: Task): Project | undefined => {
    const user = loadData();
    const projects = user?.projects || [];
    return projects.find((project) => project.tasks.some((t: Task) => t.id === task.id));
};

export const calculateTotalTime = (task: Task): number => {
    return task.sessions.reduce((total, session) => {
        if (session.end !== null) {
            const start = Date.parse(String(session.start));
            const end = Date.parse(String(session.end));
            return total + (end - start);
        }
        return total;
    }, 0);
};

export function calcPriorityComparison(user: User | null | undefined, priority: string): string {
    if (!user || !priority) {
        return "";
    }

    const tasks = user.projects.flatMap((project) => project.tasks) || [];

    const higherPriorityCount = tasks.filter((task) => {
        return task.priority === "high";
    }).length;

    const mediumPriorityCount = tasks.filter((task) => {
        return task.priority === "medium";
    }).length;

    const lowerPriorityCount = tasks.filter((task) => {
        return task.priority === "low";
    }).length;

    if (priority === "high") {
        return `Higher priority than ${lowerPriorityCount + mediumPriorityCount} other task${
            lowerPriorityCount + mediumPriorityCount > 1 ? "s" : ""
        }`;
    } else if (priority === "medium") {
        return `Higher priority than ${lowerPriorityCount} other task${
            lowerPriorityCount > 1 ? "s" : ""
        }`;
    } else {
        return `Lower priority than ${higherPriorityCount + mediumPriorityCount} other task${
            higherPriorityCount + mediumPriorityCount > 1 ? "s" : ""
        }`;
    }
}

export function calcStatusComparison(user: User | null | undefined, status: string): string {
    if (!user || !status) {
        return "";
    }

    const tasks = user.projects.flatMap((project) => project.tasks) || [];

    const sameStatusCount = tasks.filter((task) => task.status === status).length - 1;

    if (sameStatusCount === 0) {
        return `No other tasks have the same status`;
    } else if (sameStatusCount === 1) {
        return `1 other task has the same status`;
    } else {
        return `${sameStatusCount} other tasks have the same status`;
    }
}
