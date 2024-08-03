import { Project, Task, User } from "@/models";
import { addMonths, addWeeks, format, isToday } from "date-fns";
import {
    Bell,
    Book,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Copy,
    CreditCard,
    File,
    History,
    Home,
    LineChart,
    ListFilter,
    MoreVertical,
    Package,
    Package2,
    PanelLeft,
    Search,
    Settings,
    ShoppingCart,
    Terminal,
    Truck,
    Users2,
    Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useEffect } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { formatDateToDistanceFromNow, msToShortTime } from "@/utils/dateUtils";
import { downloadData } from "@/utils/export";
import { loadData } from "@/utils/load";
import { getProjectWithMostSessionDuration, getProjectWithMostSessionDurationInInterval } from "@/utils/projectUtils";
import { getSessionStorageItem, setSessionStorageItem } from "@/utils/sessionStorage";
import { getSessionDuration, isSessionInDateRange } from "@/utils/sessionUtils";
import {
    getMostRecentSessionDateOfTask,
    getTaskWithMostSessionDuration,
    getTaskWithMostSessionDurationInInterval,
} from "@/utils/taskUtils";
import { getMostRecentSessionDateInIntervalOfUser, getMostRecentSessionDateOfUser } from "@/utils/userUtils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useUser } from "../UserContext";
import { Component } from "./chart";
import { ChartSessionFlow } from "./chart-session-flow";
import { ChartTaskAmount } from "./chart-task-amount";
import { ChartVisits } from "./chart-visits";
import { CalendarDateRangePicker } from "./date-range-picker";
import { DemoChart } from "./demo-chart";
import { RecentSessions } from "./recent-sessions";
import { RecentTasks } from "./recent-tasks";
import { SessionsChart } from "./sessions-chart";

export default function Dashboard() {
    const { user, setUser } = useUser();

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: addWeeks(new Date(), -6),
        to: new Date(),
    });
    const rangePickerInputRef = React.useRef<HTMLButtonElement>(null);

    const [notificationsRead, setNotificationsRead] = React.useState<boolean>(false);

    useEffect(() => {
        const data = loadData();
        if (data) {
            setUser(data);
        }

        if (getSessionStorageItem("notificationsRead")) {
            setNotificationsRead(true);
        }
    }, [setUser]);

    const niceFormattedDate = (date: Date) => {
        if (!(date instanceof Date && !isNaN(date.getTime()))) {
            return "Invalid Date";
        }

        const formattedDate = isToday(date)
            ? format(date, "hh:mm aa") // 08:15 PM
            : format(date, "MMMM d"); // July 4

        return <div>{formattedDate}</div>;
    };

    const shouldShowExportNotification = (user: User) => {
        const oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1)).getTime();
        const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7)).getTime();
        const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime();
        const lastExportedTime = new Date(user.settings.lastExported).getTime();

        return (
            (user.settings.exportReminder === "daily" && lastExportedTime <= oneDayAgo) ||
            (user.settings.exportReminder === "weekly" && lastExportedTime <= oneWeekAgo) ||
            (user.settings.exportReminder === "monthly" && lastExportedTime <= oneMonthAgo)
        );
    };

    const hasNotifications = (user: User) => {
        return shouldShowExportNotification(user);
    };

    if (!user) {
        return;
    }

    console.log(getMostRecentSessionDateOfUser(user));

    const recentTasks: Task[] = user.projects
        .flatMap((project: any) =>
            project.tasks
                .map((task: any) => ({
                    ...task,
                    mostRecentDate: getMostRecentSessionDateOfTask(task),
                }))
                .sort(
                    (task1: { mostRecentDate: Date }, task2: { mostRecentDate: Date }) =>
                        new Date(task2.mostRecentDate).valueOf() - new Date(task1.mostRecentDate).valueOf(),
                ),
        )
        .slice(0, 5);

    function handleDownload(event: any): void {
        if (!dateRange) {
            toast("Please select a date range first");
            if (rangePickerInputRef.current) {
                rangePickerInputRef.current.focus();
            }
            return;
        }

        downloadData(dateRange);
    }

    function handleTabChange(value: string): void {
        if (value === "notifications") {
            setNotificationsRead(true);
            setSessionStorageItem("notificationsRead", true);
        }
    }

    function getWorkingTimeOfUser(
        user: User,
        dateRange: DateRange | undefined,
        flow: string[] = ["smooth", "good", "neutral", "disrupted"],
    ): number {
        return user.projects
            .flatMap((project) => project.tasks)
            .flatMap((task) => task.sessions)
            .filter((session) => {
                return dateRange ? isSessionInDateRange(session, dateRange) : true && flow.includes(session.flow);
            })
            .reduce((acc, session) => {
                if (!session.end) {
                    return acc + new Date().getTime() - new Date(session.start).getTime();
                }
                return acc + (new Date(session.end).getTime() - new Date(session.start).getTime());
            }, 0);
    }

    function getProjectDurationInfoText(user: User): string {
        let maxDuration = 0;
        let secondMaxDuration = 0;
        let projectWithMaxDuration: Project | null = null;

        user.projects.forEach((project) => {
            let projectDuration = 0;

            project.tasks.forEach((task) => {
                task.sessions.forEach((session) => {
                    projectDuration += getSessionDuration(session);
                });
            });

            if (projectDuration > maxDuration) {
                secondMaxDuration = maxDuration;
                maxDuration = projectDuration;
                projectWithMaxDuration = project;
            } else if (projectDuration > secondMaxDuration) {
                secondMaxDuration = projectDuration;
            }
        });

        let infoText = "";
        if (maxDuration > 0 && secondMaxDuration > 0) {
            const percentageIncrease = ((maxDuration - secondMaxDuration) / secondMaxDuration) * 100;
            infoText = `${percentageIncrease.toFixed(2)}% more than second`;
        } else {
            infoText = "No other projects";
        }

        return infoText;
    }

    function getProjectDurationInfoTextInInterval(user: User, dateRange: DateRange): string {
        let maxDuration = 0;
        let secondMaxDuration = 0;
        let projectWithMaxDuration: Project | null = null;

        user.projects.forEach((project) => {
            let projectDuration = 0;

            project.tasks.forEach((task) => {
                task.sessions.forEach((session) => {
                    if (isSessionInDateRange(session, dateRange)) {
                        projectDuration += getSessionDuration(session);
                    }
                });
            });

            if (projectDuration > maxDuration) {
                secondMaxDuration = maxDuration;
                maxDuration = projectDuration;
                projectWithMaxDuration = project;
            } else if (projectDuration > secondMaxDuration) {
                secondMaxDuration = projectDuration;
            }
        });

        let infoText = "";
        if (maxDuration > 0 && secondMaxDuration > 0) {
            const percentageIncrease = ((maxDuration - secondMaxDuration) / secondMaxDuration) * 100;
            infoText = `${percentageIncrease.toFixed(2)}% more than second`;
        } else {
            infoText = "No other projects";
        }

        return infoText;
    }

    function getTaskDurationInfoText(user: User): string {
        let maxDuration = 0;
        let secondMaxDuration = 0;
        let taskWithMaxDuration: Task | undefined = undefined;

        user.projects.forEach((project) => {
            project.tasks.forEach((task) => {
                let taskDuration = 0;

                task.sessions.forEach((session) => {
                    taskDuration += getSessionDuration(session);
                });

                if (taskDuration > maxDuration) {
                    secondMaxDuration = maxDuration;
                    maxDuration = taskDuration;
                    taskWithMaxDuration = task;
                } else if (taskDuration > secondMaxDuration) {
                    secondMaxDuration = taskDuration;
                }
            });
        });

        let infoText = "";
        if (maxDuration > 0 && secondMaxDuration > 0) {
            const percentageIncrease = ((maxDuration - secondMaxDuration) / secondMaxDuration) * 100;
            infoText = `${percentageIncrease.toFixed(2)}% more than second`;
        } else {
            infoText = "No other tasks";
        }

        return infoText;
    }

    function getTaskDurationInfoTextInInterval(user: User, dateRange: DateRange): string {
        let maxDuration = 0;
        let secondMaxDuration = 0;
        let taskWithMaxDuration: Task | undefined = undefined;

        user.projects.forEach((project) => {
            project.tasks.forEach((task) => {
                let taskDuration = 0;

                task.sessions.forEach((session) => {
                    if (isSessionInDateRange(session, dateRange)) {
                        taskDuration += getSessionDuration(session);
                    }
                });

                if (taskDuration > maxDuration) {
                    secondMaxDuration = maxDuration;
                    maxDuration = taskDuration;
                    taskWithMaxDuration = task;
                } else if (taskDuration > secondMaxDuration) {
                    secondMaxDuration = taskDuration;
                }
            });
        });

        let infoText = "";
        if (maxDuration > 0 && secondMaxDuration > 0) {
            const percentageIncrease = ((maxDuration - secondMaxDuration) / secondMaxDuration) * 100;
            infoText = `${percentageIncrease.toFixed(2)}% more than second`;
        } else {
            infoText = "No other tasks";
        }

        return infoText;
    }

    function getRecentTasksInfoText(user: User, dateRange: DateRange | undefined): string {
        if (dateRange == undefined) {
            var taskCount = user.projects.flatMap((project) => project.tasks).length;
            return "You worked on " + taskCount + " task" + (taskCount == 1 ? "" : "s") + ".";
        }

        var taskCount = user.projects
            .flatMap((project) => project.tasks)
            .filter((task) => task.sessions.some((session) => isSessionInDateRange(session, dateRange))).length;

        const areDatesOnSameDay = (date1: Date, date2: Date) => {
            return (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
            );
        };

        if (dateRange.to == undefined) {
            return (
                "You worked on " +
                taskCount +
                " task" +
                (taskCount == 1 ? "" : "s") +
                " on " +
                format(new Date(dateRange.from!), "MMMM d") +
                "."
            );
        } else {
            return (
                "You worked on " +
                taskCount +
                " task" +
                (taskCount == 1 ? "" : "s") +
                " between " +
                format(new Date(dateRange.from!), "MMMM d") +
                " and " +
                format(new Date(dateRange.to!), "MMMM d") +
                "."
            );
        }
    }

    function getRecentSessionsInfoText(user: User, dateRange: DateRange | undefined): string {
        if (dateRange == undefined) {
            var taskCount = user.projects.flatMap((project) => project.tasks).length;
            return "You worked on " + taskCount + " session" + (taskCount == 1 ? "" : "s") + ".";
        }

        var taskCount = user.projects
            .flatMap((project) => project.tasks.flatMap((task) => task.sessions))
            .filter((session) => isSessionInDateRange(session, dateRange)).length;

        const areDatesOnSameDay = (date1: Date, date2: Date) => {
            return (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
            );
        };

        if (dateRange.to == undefined) {
            return (
                "You worked on " +
                taskCount +
                " session" +
                (taskCount == 1 ? "" : "s") +
                " on " +
                format(new Date(dateRange.from!), "MMMM d") +
                "."
            );
        } else {
            return (
                "You worked on " +
                taskCount +
                " session" +
                (taskCount == 1 ? "" : "s") +
                " between " +
                format(new Date(dateRange.from!), "MMMM d") +
                " and " +
                format(new Date(dateRange.to!), "MMMM d") +
                "."
            );
        }
    }

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="flex-1 space-y-4 px-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-4xl font-bold tracking-tight">Dashboard</h2>
                        <div className="flex items-center space-x-2">
                            <CalendarDateRangePicker
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                                ref={rangePickerInputRef}
                            />
                            {dateRange == undefined && <Button disabled>Download</Button>}
                            {dateRange != undefined && <Button onClick={handleDownload}>Download</Button>}{" "}
                        </div>
                    </div>
                    <Tabs defaultValue="overview" className="space-y-4" onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
                            <TabsTrigger value="notifications">
                                <div className="flex items-center space-x-2">
                                    <span>Notifications</span>
                                    {hasNotifications(user) && (
                                        <Bell className={`h-4 w-4 ${!notificationsRead ? "text-primary" : ""}`} />
                                    )}
                                </div>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-4">
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-primary">
                                                Working Time
                                            </CardTitle>
                                            <Workflow className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {msToShortTime(getWorkingTimeOfUser(user, dateRange))}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {(
                                                    (getWorkingTimeOfUser(user, dateRange, ["smooth"]) /
                                                        getWorkingTimeOfUser(user, dateRange)) *
                                                    100
                                                ).toFixed(2)}
                                                {"% "}
                                                working really smooth
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-primary">
                                                Most common project
                                            </CardTitle>
                                            <Book className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {dateRange
                                                    ? getProjectWithMostSessionDurationInInterval(user, dateRange)?.name
                                                    : getProjectWithMostSessionDuration(user)?.name}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {dateRange
                                                    ? getProjectDurationInfoTextInInterval(user, dateRange)
                                                    : getProjectDurationInfoText(user)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-primary">
                                                Most common task
                                            </CardTitle>
                                            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {dateRange
                                                    ? getTaskWithMostSessionDurationInInterval(user, dateRange)?.name
                                                    : getTaskWithMostSessionDuration(user)?.name}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {dateRange
                                                    ? getTaskDurationInfoTextInInterval(user, dateRange)
                                                    : getTaskDurationInfoText(user)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-primary">
                                                Last time working {dateRange && dateRange.to ? "in given interval" : ""}
                                            </CardTitle>
                                            <History className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {niceFormattedDate(
                                                    dateRange && dateRange.to
                                                        ? getMostRecentSessionDateInIntervalOfUser(user, dateRange)
                                                        : getMostRecentSessionDateOfUser(user),
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateToDistanceFromNow(
                                                    dateRange && dateRange.to
                                                        ? getMostRecentSessionDateInIntervalOfUser(user, dateRange)
                                                        : getMostRecentSessionDateOfUser(user),
                                                )}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                    <ChartTaskAmount user={user} className="col-span-2" />
                                    <Card className="col-span-4 lg:col-span-3">
                                        <CardHeader>
                                            <CardTitle>Recent Tasks</CardTitle>
                                            <CardDescription>{getRecentTasksInfoText(user, dateRange)}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <RecentTasks dateRange={dateRange} limit={6} />
                                        </CardContent>
                                    </Card>
                                    <ChartSessionFlow user={user} className="col-span-2" />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                    <Card className="col-span-4 lg:col-span-3">
                                        <CardHeader>
                                            <CardTitle>Recent Sessions</CardTitle>
                                            <CardDescription>
                                                {getRecentSessionsInfoText(user, dateRange)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <RecentSessions dateRange={dateRange} />
                                        </CardContent>
                                    </Card>
                                    <ChartVisits user={user} className="col-span-4" />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="notifications" className="space-y-4">
                            {!hasNotifications(user) && (
                                <Card className="col-span-4 lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle>Feels lonely here</CardTitle>
                                        <CardDescription>
                                            You have no notifications. If you had notifications, there would be a{" "}
                                            <Bell className="h-4 w-4 inline-block" /> icon right next to the
                                            &quot;Notifications&quot; tab.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            )}
                            {shouldShowExportNotification(user) && (
                                <Alert className="mb-12">
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Notification!</AlertTitle>
                                    <AlertDescription>
                                        We recommend exporting your data regularly. Head to Settings → Data Management
                                        to export your data now. Stay safe!
                                    </AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
