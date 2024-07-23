import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Bell,
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useUser } from "../UserContext";
import { loadData } from "@/utils/load";
import { useEffect } from "react";
import { Task, User } from "@/models";
import { getMostRecentSessionDateOfTask } from "@/utils/taskUtils";
import { CalendarDateRangePicker } from "./date-range-picker";
import { Overview } from "./overview";
import { RecentSessions } from "./recent-sessions";
import { Component } from "./chart";
import { addWeeks, addMonths, isToday, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { downloadData } from "@/utils/export";
import { toast } from "sonner";
import { getSessionStorageItem, setSessionStorageItem } from "@/utils/sessionStorage";
import { formatDateToDistanceFromNow, msToShortTime } from "@/utils/dateUtils";
import { SessionsChart } from "./sessions-chart";
import { RecentTasks } from "./recent-tasks";
import { getMostRecentSessionDateOfUser } from "@/utils/userUtils";

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
                        new Date(task2.mostRecentDate).valueOf() -
                        new Date(task1.mostRecentDate).valueOf()
                )
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

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="flex-1 space-y-4 px-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-4xl font-bold tracking-tight">Dashboard</h2>
                        <div className="flex items-center space-x-2">
                            <CalendarDateRangePicker
                                date={date}
                                setDate={setDate}
                                ref={rangePickerInputRef}
                            />
                            {date == undefined && <Button disabled>Download</Button>}
                            {date != undefined && (
                                <Button onClick={handleDownload}>Download</Button>
                            )}{" "}
                        </div>
                    </div>
                    <Tabs
                        defaultValue="overview"
                        className="space-y-4"
                        onValueChange={handleTabChange}
                    >
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="notifications">
                                <div className="flex items-center space-x-2">
                                    <span>Notifications</span>
                                    {hasNotifications(user) && (
                                        <Bell
                                            className={`h-4 w-4 ${
                                                !notificationsRead ? "text-primary" : ""
                                            }`}
                                        />
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
                                                    {msToShortTime(
                                                        user.projects
                                                            .flatMap((project) => project.tasks)
                                                            .flatMap((task) => task.sessions)
                                                            .filter((session) => {
                                                                const isWithinDateRange = (
                                                                    date: string | number | Date,
                                                                    dateRange: DateRange
                                                                ) => {
                                                                    const from = new Date(
                                                                        dateRange.from!
                                                                    ).getTime();
                                                                    const to = dateRange.to
                                                                        ? new Date(
                                                                              new Date(
                                                                                  dateRange.to
                                                                              ).setHours(
                                                                                  23,
                                                                                  59,
                                                                                  59,
                                                                                  999
                                                                              )
                                                                          ).getTime()
                                                                        : new Date(
                                                                              new Date(
                                                                                  dateRange.from!
                                                                              ).setHours(
                                                                                  23,
                                                                                  59,
                                                                                  59,
                                                                                  999
                                                                              )
                                                                          ).getTime();
                                                                    const sessionDate = new Date(
                                                                        date
                                                                    ).getTime();
                                                                    return (
                                                                        sessionDate >= from &&
                                                                        sessionDate <= to
                                                                    );
                                                                };

                                                                return isWithinDateRange(
                                                                    session.start,
                                                                    date
                                                                );
                                                            })
                                                            .reduce((acc, session) => {
                                                                if (!session.end) {
                                                                    return (
                                                                        acc +
                                                                        new Date().getTime() -
                                                                        new Date(
                                                                            session.start
                                                                        ).getTime()
                                                                    );
                                                                }
                                                                return (
                                                                    acc +
                                                                    (new Date(
                                                                        session.end
                                                                    ).getTime() -
                                                                        new Date(
                                                                            session.start
                                                                        ).getTime())
                                                                );
                                                            }, 0)
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {(
                                                        (user.projects
                                                            .flatMap((project) => project.tasks)
                                                            .flatMap((task) => task.sessions)
                                                            .filter((session) => {
                                                                const isWithinDateRange = (
                                                                    date: string | number | Date,
                                                                    dateRange: DateRange
                                                                ) => {
                                                                    const from = new Date(
                                                                        dateRange.from!
                                                                    ).getTime();
                                                                    const to = dateRange.to
                                                                        ? new Date(
                                                                              new Date(
                                                                                  dateRange.to
                                                                              ).setHours(
                                                                                  23,
                                                                                  59,
                                                                                  59,
                                                                                  999
                                                                              )
                                                                          ).getTime()
                                                                        : new Date(
                                                                              new Date(
                                                                                  dateRange.from!
                                                                              ).setHours(
                                                                                  23,
                                                                                  59,
                                                                                  59,
                                                                                  999
                                                                              )
                                                                          ).getTime();
                                                                    const sessionDate = new Date(
                                                                        date
                                                                    ).getTime();
                                                                    return (
                                                                        sessionDate >= from &&
                                                                        sessionDate <= to
                                                                    );
                                                                };

                                                                return (
                                                                    isWithinDateRange(
                                                                        session.start,
                                                                        date
                                                                    ) && session.flow == "smooth"
                                                                );
                                                            })
                                                            .reduce((acc, session) => {
                                                                if (!session.end) {
                                                                    return (
                                                                        acc +
                                                                        new Date().getTime() -
                                                                        new Date(
                                                                            session.start
                                                                        ).getTime()
                                                                    );
                                                                }
                                                                return (
                                                                    acc +
                                                                    (new Date(
                                                                        session.end
                                                                    ).getTime() -
                                                                        new Date(
                                                                            session.start
                                                                        ).getTime())
                                                                );
                                                            }, 0) /
                                                            user.projects
                                                                .flatMap((project) => project.tasks)
                                                                .flatMap((task) => task.sessions)
                                                                .filter((session) => {
                                                                    const isWithinDateRange = (
                                                                        date:
                                                                            | string
                                                                            | number
                                                                            | Date,
                                                                        dateRange: DateRange
                                                                    ) => {
                                                                        const from = new Date(
                                                                            dateRange.from!
                                                                        ).getTime();
                                                                        const to = dateRange.to
                                                                            ? new Date(
                                                                                  new Date(
                                                                                      dateRange.to
                                                                                  ).setHours(
                                                                                      23,
                                                                                      59,
                                                                                      59,
                                                                                      999
                                                                                  )
                                                                              ).getTime()
                                                                            : new Date(
                                                                                  new Date(
                                                                                      dateRange.from!
                                                                                  ).setHours(
                                                                                      23,
                                                                                      59,
                                                                                      59,
                                                                                      999
                                                                                  )
                                                                              ).getTime();
                                                                        const sessionDate =
                                                                            new Date(
                                                                                date
                                                                            ).getTime();
                                                                        return (
                                                                            sessionDate >= from &&
                                                                            sessionDate <= to
                                                                        );
                                                                    };

                                                                    return isWithinDateRange(
                                                                        session.start,
                                                                        date
                                                                    );
                                                                })
                                                                .reduce((acc, session) => {
                                                                    if (!session.end) {
                                                                        return (
                                                                            acc +
                                                                            new Date().getTime() -
                                                                            new Date(
                                                                                session.start
                                                                            ).getTime()
                                                                        );
                                                                    }
                                                                    return (
                                                                        acc +
                                                                        (new Date(
                                                                            session.end
                                                                        ).getTime() -
                                                                            new Date(
                                                                                session.start
                                                                            ).getTime())
                                                                    );
                                                                }, 0)) *
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
                                                <History className="h-4 w-4" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {niceFormattedDate(
                                                        getMostRecentSessionDateOfUser(user)
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateToDistanceFromNow(
                                                        getMostRecentSessionDateOfUser(user)
                                                    )}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-primary">
                                                    Sales
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
                                                    <rect
                                                        width="20"
                                                        height="14"
                                                        x="2"
                                                        y="5"
                                                        rx="2"
                                                    />
                                                    <path d="M2 10h20" />
                                                </svg>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">+12,234</div>
                                                <p className="text-xs text-muted-foreground">
                                                    +19% from last month
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
                                                <p className="text-xs text-muted-foreground">
                                                    +201 since last hour
                                                </p>
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
                                                                task.sessions.some((session) => {
                                                                    return (
                                                                        new Date(
                                                                            session.end ??
                                                                                session.start
                                                                        ).getTime() >=
                                                                            new Date(
                                                                                date.from!
                                                                            ).getTime() &&
                                                                        new Date(
                                                                            session.end ??
                                                                                session.start
                                                                        ).getTime() <=
                                                                            new Date(
                                                                                date.to!
                                                                            ).setHours(
                                                                                23,
                                                                                59,
                                                                                59,
                                                                                999
                                                                            )
                                                                    );
                                                                })
                                                            ).length
                                                    }{" "}
                                                    task
                                                    {user.projects
                                                        .flatMap((project) => project.tasks)
                                                        .filter((task) =>
                                                            task.sessions.some((session) => {
                                                                return (
                                                                    new Date(
                                                                        session.end ?? session.start
                                                                    ).getTime() >=
                                                                        new Date(
                                                                            date.from!
                                                                        ).getTime() &&
                                                                    new Date(
                                                                        session.end ?? session.start
                                                                    ).getTime() <=
                                                                        new Date(date.to!).setHours(
                                                                            23,
                                                                            59,
                                                                            59,
                                                                            999
                                                                        )
                                                                );
                                                            })
                                                        ).length == 1
                                                        ? ""
                                                        : "s"}{" "}
                                                    between {format(date.from!, "MMMM d")} and{" "}
                                                    {format(
                                                        date.to ??
                                                            new Date(
                                                                date.from!.setHours(23, 59, 59, 999)
                                                            ),
                                                        "MMMM d"
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
                                                                project.tasks.flatMap(
                                                                    (task) => task.sessions
                                                                )
                                                            )
                                                            .filter((session) => {
                                                                const monthStart = new Date(
                                                                    new Date().getFullYear(),
                                                                    new Date().getMonth(),
                                                                    1,
                                                                    0,
                                                                    0,
                                                                    0
                                                                );

                                                                return (
                                                                    new Date(
                                                                        session.start
                                                                    ).getTime() >
                                                                    monthStart.getTime()
                                                                );
                                                            }).length
                                                    }{" "}
                                                    session
                                                    {user.projects
                                                        .flatMap((project) =>
                                                            project.tasks.flatMap(
                                                                (task) => task.sessions
                                                            )
                                                        )
                                                        .filter((session) => {
                                                            const monthStart = new Date(
                                                                new Date().getFullYear(),
                                                                new Date().getMonth(),
                                                                1,
                                                                0,
                                                                0,
                                                                0
                                                            );

                                                            return (
                                                                new Date(session.start).getTime() >
                                                                monthStart.getTime()
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
                                        <CardDescription>
                                            Please select a date range first.
                                        </CardDescription>
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
                                            You have no notifications. If you had notifications,
                                            there would be a{" "}
                                            <Bell className="h-4 w-4 inline-block" /> icon right
                                            next to the &quot;Notifications&quot; tab.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            )}
                            {shouldShowExportNotification(user) && (
                                <Alert className="mb-12">
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Notification!</AlertTitle>
                                    <AlertDescription>
                                        We recommend exporting your data regularly. Head to Settings
                                        → Data Management to export your data now. Stay safe!
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
