import { Session, User } from "@/models";

export const initializeSession = (): Session => {
    return {
        id: crypto.randomUUID(),
        flow: "good",
        start: new Date(Date.now() - 3 * 60 * 60 * 1000),
        end: new Date(),
    };
};

export function calcFlowComparison(user: User | null | undefined, flow: string): string {
    if (!user || !flow) {
        return "";
    }

    const sessions =
        user.projects.flatMap((project) => project.tasks.flatMap((task) => task.sessions)) || [];

    const higherFlowCount = sessions.filter((session) => {
        return session.flow === "smooth";
    }).length;

    const mediumFlowCount = sessions.filter((session) => {
        return session.flow === "good";
    }).length;

    const lowerFlowCount = sessions.filter((session) => {
        return session.flow === "neutral";
    }).length;

    const disruptedFlowCount = sessions.filter((session) => {
        return session.flow === "disrupted";
    }).length;

    if (flow === "smooth") {
        return `Better flow than ${
            disruptedFlowCount + lowerFlowCount + mediumFlowCount
        } other session${disruptedFlowCount + lowerFlowCount + mediumFlowCount !== 1 ? "s" : ""}`;
    } else if (flow === "good") {
        return `Better flow than ${disruptedFlowCount + lowerFlowCount} other session${
            disruptedFlowCount + lowerFlowCount !== 1 ? "s" : ""
        }`;
    } else if (flow === "neutral") {
        return `Worse flow than ${higherFlowCount + mediumFlowCount} other session${
            higherFlowCount + mediumFlowCount !== 1 ? "s" : ""
        }`;
    } else {
        return `Worse flow than ${
            higherFlowCount + mediumFlowCount + lowerFlowCount
        } other session${higherFlowCount + mediumFlowCount + lowerFlowCount !== 1 ? "s" : ""}`;
    }
}

// Assuming this function calculates how the current session duration compares to others
export function calcDurationComparison(user: User, session: Session) {
    // Example logic: compare current session duration to average of other sessions
    const avgDurationOfOtherSessions = calculateAverageDurationOfOtherSessions(user);

    console.log("Average duration of other sessions:", avgDurationOfOtherSessions);

    const currentSessionDuration = session.end
        ? new Date(session.end!).getTime() - new Date(session.start).getTime()
        : Date.now() - new Date(session.start).getTime();

    console.log("Current session duration:", currentSessionDuration);

    const sessions =
        user.projects.flatMap((project) => project.tasks.flatMap((task) => task.sessions)) || [];

    const shorterSessionCount = sessions.filter((s) => {
        const sessionDuration = s.end
            ? new Date(s.end).getTime() - new Date(s.start).getTime()
            : Date.now() - new Date(s.start).getTime();

        return s.id !== session.id && sessionDuration < currentSessionDuration;
    }).length;

    const longerSessionCount = sessions.filter((s) => {
        const sessionDuration = s.end
            ? new Date(s.end).getTime() - new Date(s.start).getTime()
            : Date.now() - new Date(s.start).getTime();

        return s.id !== session.id && sessionDuration > currentSessionDuration;
    }).length;

    if (currentSessionDuration > avgDurationOfOtherSessions) {
        // Shorter than average
        return `Longer than ${shorterSessionCount} other session${
            shorterSessionCount !== 1 ? "s" : ""
        }`;
    } else {
        // Longer than average
        return `Shorter than ${longerSessionCount} other session${
            longerSessionCount !== 1 ? "s" : ""
        }`;
    }
}

// Function to calculate the average duration of sessions in other tasks
function calculateAverageDurationOfOtherSessions(user: User) {
    let totalDuration = 0;
    let sessionCount = 0;

    // Loop through user's projects and tasks to calculate total duration and count of sessions
    user.projects.forEach((project) => {
        project.tasks.forEach((task) => {
            task.sessions.forEach((session) => {
                const sessionStart = new Date(session.start);
                const sessionEnd = session.end ? new Date(session.end) : new Date();

                if (sessionStart) {
                    const sessionDuration = sessionEnd.getTime() - sessionStart.getTime();
                    totalDuration += sessionDuration;
                    sessionCount++;
                }
            });
        });
    });

    // Calculate average duration of sessions in other tasks
    const avgDuration = sessionCount > 0 ? totalDuration / sessionCount : 0;

    return avgDuration;
}

function calculateNumberOfShorterSessions(user: User, currentDuration: number) {
    // Logic to count sessions shorter than current duration
    return 3; // Example number of sessions shorter than current duration
}

function calculateNumberOfLongerSessions(user: User, currentDuration: number) {
    // Logic to count sessions longer than current duration
    return 1; // Example number of sessions longer than current duration
}
