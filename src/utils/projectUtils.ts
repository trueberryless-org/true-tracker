import { Project, User } from "@/models";

export const initializeProject = (): Project => {
    return {
        id: crypto.randomUUID(),
        name: "New Project",
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        archivedAt: null,
        status: "planned",
        priority: "medium",
        tasks: [],
    };
};

export function calcPriorityComparison(user: User | null | undefined, priority: string): string {
    if (!user || !priority) {
        return "";
    }

    const projects = user.projects || [];

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
        return `Higher priority than ${lowerPriorityCount + mediumPriorityCount} other project${
            lowerPriorityCount + mediumPriorityCount > 1 ? "s" : ""
        }`;
    } else if (priority === "medium") {
        return `Higher priority than ${lowerPriorityCount} other project${
            lowerPriorityCount > 1 ? "s" : ""
        }`;
    } else {
        return `Lower priority than ${higherPriorityCount + mediumPriorityCount} other project${
            higherPriorityCount + mediumPriorityCount > 1 ? "s" : ""
        }`;
    }
}

export function calcStatusComparison(user: User | null | undefined, status: string): string {
    if (!user || !status) {
        return "";
    }

    const projects = user.projects || [];

    const sameStatusCount = projects.filter((proj) => proj.status === status).length - 1;

    if (sameStatusCount === 0) {
        return `No other projects have the same status`;
    } else if (sameStatusCount === 1) {
        return `1 other project has the same status`;
    } else {
        return `${sameStatusCount} other projects have the same status`;
    }
}

export const getMostRecentSessionDate = (project: Project) => {
    const dates = project.tasks.flatMap((task) =>
        task.sessions.map((session) => new Date(session.end ?? session.start).getTime())
    );
    return new Date(Math.max(...dates));
};
