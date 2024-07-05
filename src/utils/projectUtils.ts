import { User } from "@/models";

export function calcPriorityComparison(user: User | null | undefined, priority: string): string {
    if (!user || !priority) {
        return "";
    }

    const projects = user.projects || [];
    const currentProject = projects.find((proj) => proj.priority === priority);

    if (!currentProject) {
        return "";
    }

    const higherPriorityCount = projects.filter((proj) => {
        return proj.priority === "high";
    }).length;

    const mediumPriorityCount = projects.filter((proj) => {
        return proj.priority === "medium";
    }).length;

    const lowerPriorityCount = projects.filter((proj) => {
        return proj.priority === "low";
    }).length;

    if (priority === "high") {
        return `Higher priority than ${lowerPriorityCount + mediumPriorityCount} other projects`;
    } else if (priority === "medium") {
        return `Higher priority than ${lowerPriorityCount} other projects`;
    } else {
        return `Lower priority than ${higherPriorityCount + mediumPriorityCount} other projects`;
    }
}

export function calcStatusComparison(user: User | null | undefined, status: string): string {
    if (!user || !status) {
        return "";
    }

    const projects = user.projects || [];
    const currentProject = projects.find((proj) => proj.status === status);

    if (!currentProject) {
        return "";
    }

    const sameStatusCount = projects.filter(
        (proj) => proj.status === status && proj.id !== currentProject.id
    ).length;

    if (sameStatusCount === 0) {
        return `No other projects have the same status`;
    } else if (sameStatusCount === 1) {
        return `1 other project has the same status`;
    } else {
        return `${sameStatusCount} other projects have the same status`;
    }
}
