import { User } from "@/models";

export function getMostRecentSessionDateOfUser(user: User) {
    const dates = user.projects
        .flatMap((project) => project.tasks.flatMap((task) => task.sessions))
        .map((session) => new Date(session.end ?? session.start).getTime());
    return new Date(Math.max(...dates));
}
