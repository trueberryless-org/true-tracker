import { Project, Task, User } from "@/models";
import { addMonths, addWeeks, format, isToday } from "date-fns";
import {
    Bell,
    Book,
    ChevronLeft,
    ChevronRight,
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
import { getProjectWithMostSessionDurationInInterval } from "@/utils/projectUtils";
import { getSessionStorageItem, setSessionStorageItem } from "@/utils/sessionStorage";
import { getSessionDuration, isSessionInDateRange } from "@/utils/sessionUtils";
import { getMostRecentSessionDateOfTask } from "@/utils/taskUtils";
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
import { CalendarDateRangePicker } from "./date-range-picker";
import { Overview } from "./overview";
import { RecentSessions } from "./recent-sessions";
import { RecentTasks } from "./recent-tasks";
import { SessionsChart } from "./sessions-chart";

export default function Dashboard() {
    const { user, setUser } = useUser();

    const [date, setDate] = React.useState<DateRange | undefined>({
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
        if (!date) {
            toast("Please select a date range first");
            if (rangePickerInputRef.current) {
                rangePickerInputRef.current.focus();
            }
            return;
        }

        downloadData(date);
    }

    function handleTabChange(value: string): void {
        if (value === "notifications") {
            setNotificationsRead(true);
            setSessionStorageItem("notificationsRead", true);
        }
    }

    function getWorkingTimeOfUser(user: User, flow: string[] = ["smooth", "good", "neutral", "disrupted"]): number {
        console.log(date);
        if (date == undefined) {
            return 0;
        }
        return user.projects
            .flatMap((project) => project.tasks)
            .flatMap((task) => task.sessions)
            .filter((session) => {
                return isSessionInDateRange(session, date!) && flow.includes(session.flow);
            })
            .reduce((acc, session) => {
                if (!session.end) {
                    return acc + new Date().getTime() - new Date(session.start).getTime();
                }
                return acc + (new Date(session.end).getTime() - new Date(session.start).getTime());
            }, 0);
    }

    function getProjectDurationInfoText(user: User, dateRange: DateRange): string {
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

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="flex-1 space-y-4 px-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-4xl font-bold tracking-tight">Dashboard</h2>
                        <div className="flex items-center space-x-2">
                            <CalendarDateRangePicker date={date} setDate={setDate} ref={rangePickerInputRef} />
                            {date == undefined && <Button disabled>Download</Button>}
                            {date != undefined && <Button onClick={handleDownload}>Download</Button>}{" "}
                        </div>
                    </div>
                    <Tabs defaultValue="overview" className="space-y-4" onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                            {date != undefined && (
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
                                                    {msToShortTime(getWorkingTimeOfUser(user))}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {(
                                                        (getWorkingTimeOfUser(user, ["smooth"]) /
                                                            getWorkingTimeOfUser(user)) *
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
                                                    Last time working
                                                </CardTitle>
                                                <History className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {niceFormattedDate(
                                                        getMostRecentSessionDateInIntervalOfUser(user, date),
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateToDistanceFromNow(
                                                        getMostRecentSessionDateInIntervalOfUser(user, date),
                                                    )}
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
                                                    {getProjectWithMostSessionDurationInInterval(user, date)?.name}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {getProjectDurationInfoText(user, date)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-primary">
                                                    Active Now
                                                </CardTitle>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    className="h-4 w-4 text-muted-foreground"
                                                >
                                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                                </svg>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">+573</div>
                                                <p className="text-xs text-muted-foreground">+201 since last hour</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                        <Card className="col-span-4">
                                            <CardHeader>
                                                <CardTitle>Overview</CardTitle>
                                            </CardHeader>
                                            <CardContent className="pl-2">
                                                <Overview />
                                            </CardContent>
                                        </Card>
                                        <Card className="col-span-4 lg:col-span-3">
                                            <CardHeader>
                                                <CardTitle>Recent Tasks</CardTitle>
                                                <CardDescription>
                                                    You worked on{" "}
                                                    {
                                                        user.projects
                                                            .flatMap((project) => project.tasks)
                                                            .filter((task) =>
                                                                task.sessions.some((session) =>
                                                                    isSessionInDateRange(session, date),
                                                                ),
                                                            ).length
                                                    }{" "}
                                                    task
                                                    {user.projects
                                                        .flatMap((project) => project.tasks)
                                                        .filter((task) =>
                                                            task.sessions.some((session) =>
                                                                isSessionInDateRange(session, date),
                                                            ),
                                                        ).length == 1
                                                        ? ""
                                                        : "s"}{" "}
                                                    between {format(date.from!, "MMMM d")} and{" "}
                                                    {format(
                                                        date.to ?? new Date(date.from!.setHours(23, 59, 59, 999)),
                                                        "MMMM d",
                                                    )}
                                                    .
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <RecentTasks dateRange={date} limit={6} />
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                        <Card className="col-span-4 lg:col-span-3">
                                            <CardHeader>
                                                <CardTitle>Recent Sessions</CardTitle>
                                                <CardDescription>
                                                    You started{" "}
                                                    {
                                                        user.projects
                                                            .flatMap((project) =>
                                                                project.tasks.flatMap((task) => task.sessions),
                                                            )
                                                            .filter((session) => {
                                                                const monthStart = new Date(
                                                                    new Date().getFullYear(),
                                                                    new Date().getMonth(),
                                                                    1,
                                                                    0,
                                                                    0,
                                                                    0,
                                                                );

                                                                return (
                                                                    new Date(session.start).getTime() >
                                                                    monthStart.getTime()
                                                                );
                                                            }).length
                                                    }{" "}
                                                    session
                                                    {user.projects
                                                        .flatMap((project) =>
                                                            project.tasks.flatMap((task) => task.sessions),
                                                        )
                                                        .filter((session) => {
                                                            const monthStart = new Date(
                                                                new Date().getFullYear(),
                                                                new Date().getMonth(),
                                                                1,
                                                                0,
                                                                0,
                                                                0,
                                                            );

                                                            return (
                                                                new Date(session.start).getTime() > monthStart.getTime()
                                                            );
                                                        }).length == 1
                                                        ? ""
                                                        : "s"}{" "}
                                                    this month.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <RecentSessions dateRange={date} />
                                            </CardContent>
                                        </Card>
                                        <Card className="col-span-4">
                                            <CardHeader>
                                                <CardTitle>Overview</CardTitle>
                                            </CardHeader>
                                            <CardContent className="pl-2">
                                                <Overview />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                            {date == undefined && (
                                <Card className="col-span-4 lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle>Life is short</CardTitle>
                                        <CardDescription>Please select a date range first.</CardDescription>
                                    </CardHeader>
                                </Card>
                            )}
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
