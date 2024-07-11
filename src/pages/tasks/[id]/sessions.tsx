import { useState, useEffect, Key } from "react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/UserContext";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTable } from "@/components/tasks/data-table";
import {
    columnsXl,
    columnsLg,
    columnsMd,
    columnsSm,
    columnsMobile,
} from "@/components/tasks/columns";
import router from "next/router";
import { Project, Task, Session } from "@/models";
import { formatDateTime, formatDateToDistanceFromNow } from "@/utils/dateUtils";
import StartStopButton from "@/components/tasks/start-stop-button";
import { saveData } from "@/utils/save";

export default function Tasks() {
    const { user, setUser } = useUser();
    const [forceUpdate, setForceUpdate] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setForceUpdate((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!user) {
        return (
            <div className="flex w-full flex-col">
                <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                    <Alert variant="default">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Loading...</AlertTitle>
                        <AlertDescription>
                            We are currently trying to fetch your data from your local storage.
                        </AlertDescription>
                    </Alert>
                </main>
            </div>
        );
    }

    const foundTask = user?.projects
        .flatMap((project) => project.tasks)
        .find((task) => task.id === router.query.id);

    const task = foundTask
        ? {
              ...foundTask,
              projectName:
                  user?.projects.find((project) =>
                      project.tasks.some((t: { id: any }) => t.id === foundTask.id)
                  )?.name || "Project Not Found",
              projectId:
                  user?.projects.find((project) =>
                      project.tasks.some((t: { id: any }) => t.id === foundTask.id)
                  )?.id || undefined,
              projectIsArchived:
                  user?.projects.find((project) =>
                      project.tasks.some((t: { id: any }) => t.id === foundTask.id)
                  )?.archivedAt !== null,
          }
        : undefined;

    const handleSessionChange = (taskId: string, newSession: Session) => {
        if (user) {
            const updatedProjects = user.projects.map((project) => {
                const updatedTasks = project.tasks.map(
                    (task: { id: string; sessions: Session[] }) => {
                        if (task.id === taskId) {
                            if (newSession.end === null) {
                                // Start a new Session
                                return {
                                    ...task,
                                    sessions: [...task.sessions, newSession],
                                };
                            } else {
                                // Stop the current Session
                                const updatedSessions = task.sessions.map((session) =>
                                    session.end ? session : { ...session, end: new Date() }
                                );
                                return {
                                    ...task,
                                    sessions: updatedSessions,
                                };
                            }
                        }
                        return task;
                    }
                );

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
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                Sessions of{" "}
                                {task.name.toLowerCase().includes("task")
                                    ? task.name
                                    : "Task " + task.name}
                            </div>
                            {!task.projectIsArchived && (
                                <StartStopButton
                                    key={task.id}
                                    task={task}
                                    onSessionChange={handleSessionChange}
                                ></StartStopButton>
                            )}
                        </div>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Start</TableHead>
                                <TableHead className="text-right">End</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {task.sessions
                                .sort(
                                    (a: Session, b: Session) =>
                                        new Date(b.start).getTime() - new Date(a.start).getTime()
                                )
                                .map((session: Session, i: Key | null | undefined) => {
                                    return (
                                        <TableRow
                                            key={i}
                                            // onClick={() => router.push(`/tasks/${task.id}`)}
                                            // className="cursor-pointer"
                                        >
                                            <TableCell>
                                                <div className="font-medium">
                                                    {formatDateTime(new Date(session.start))}
                                                </div>
                                                <div className="hidden text-sm text-muted-foreground md:inline">
                                                    {formatDateToDistanceFromNow(
                                                        new Date(session.start)
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="font-medium">
                                                    {session.end
                                                        ? formatDateTime(new Date(session.end))
                                                        : "Active"}
                                                </div>
                                                <div className="hidden text-sm text-muted-foreground md:inline">
                                                    {session.end
                                                        ? formatDateToDistanceFromNow(
                                                              new Date(session.end)
                                                          )
                                                        : ""}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </Card>
            </main>
        </div>
    );
}
