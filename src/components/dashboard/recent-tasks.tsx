import { Session, Task } from "@/models";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { saveData } from "@/utils/save";
import { isSessionInDateRange } from "@/utils/sessionUtils";
import {
    getMostRecentSessionDateInIntervalOfTask,
    getMostRecentSessionDateOfTask,
    getProjectOfTask,
} from "@/utils/taskUtils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useUser } from "../UserContext";
import StartStopButton from "../tasks/start-stop-button";
import StatusIconLabel from "../tasks/status";

interface RecentTasksProps {
    dateRange: DateRange | undefined;
    limit?: number;
}

export const RecentTasks: React.FC<RecentTasksProps> = ({ dateRange, limit = 7 }) => {
    const { user, setUser } = useUser();

    const handleSessionChange = (taskId: string, newSession: Session) => {
        if (user) {
            const updatedProjects = user.projects.map((project) => {
                const updatedTasks = project.tasks.map((task: Task) => {
                    if (task.id === taskId) {
                        if (newSession.end === null) {
                            // Start a new Session
                            if (task.sessions.length === 0 && (task.status === "backlog" || task.status === "todo")) {
                                let taskMoved = false;
                                let projectMoved = false;

                                if (user.settings.automation.taskStatusKickoff) {
                                    task.status = "in progress";
                                    taskMoved = true;
                                }
                                if (user.settings.automation.projectStatusKickoff) {
                                    project.status = "in progress";
                                    projectMoved = true;
                                }

                                if (taskMoved && projectMoved) {
                                    toast("We automatically moved your task and project to “In Progress”.");
                                } else if (taskMoved) {
                                    toast("We automatically moved your task to “In Progress”.");
                                } else if (projectMoved) {
                                    toast("We automatically moved your project to “In Progress”.");
                                }
                            }

                            return {
                                ...task,
                                sessions: [...task.sessions, newSession],
                            };
                        } else {
                            // Stop the current Session
                            const updatedSessions = task.sessions.map((session) =>
                                session.end ? session : { ...session, end: new Date() },
                            );
                            return {
                                ...task,
                                sessions: updatedSessions,
                            };
                        }
                    }
                    return task;
                });

                return {
                    ...project,
                    tasks: updatedTasks,
                };
            });

            const updatedUser = {
                ...user,
                projects: updatedProjects,
            };

            setUser(updatedUser);
            saveData(updatedUser);
        }
    };

    return (
        <div className="space-y-0">
            {user?.projects
                .flatMap((project) => project.tasks)
                .filter((task) => {
                    if (!dateRange) {
                        return true;
                    }

                    return task.sessions.some((session) => isSessionInDateRange(session, dateRange));
                })
                .sort((a, b) => {
                    if (!dateRange) {
                        return (
                            getMostRecentSessionDateOfTask(b).getTime() - getMostRecentSessionDateOfTask(a).getTime()
                        );
                    }
                    return (
                        getMostRecentSessionDateInIntervalOfTask(b, dateRange).getTime() -
                        getMostRecentSessionDateInIntervalOfTask(a, dateRange).getTime()
                    );
                })
                .slice(0, limit)
                .map((task, index) => (
                    <Link
                        className="flex items-center cursor-pointer hover:bg-secondary/50 rounded-lg py-4 hover:px-4 transition-all duration-300"
                        key={index}
                        href={`/tasks/${task.id}`}
                    >
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>
                                {task.priority === "low" && <ArrowDown className="h-4 w-4" />}{" "}
                                {task.priority === "medium" && <ArrowRight className="h-4 w-4" />}
                                {task.priority === "high" && <ArrowUp className="h-4 w-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {getProjectOfTask(task, user)?.name} - {task.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <StatusIconLabel statusValue={task.status} />
                            </p>
                        </div>
                        <div className="ml-auto font-medium">
                            <StartStopButton
                                key={task.id}
                                task={task}
                                onSessionChange={handleSessionChange}
                                showElapsedTime={false}
                            ></StartStopButton>
                        </div>
                    </Link>
                ))}
        </div>
    );
};
