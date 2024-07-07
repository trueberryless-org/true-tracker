import { useRouter } from "next/router";
import { useUser } from "@/components/UserContext";

import Link from "next/link";
import {
    Activity,
    ArrowUpRight,
    CircleUser,
    CreditCard,
    DollarSign,
    Menu,
    Package2,
    Search,
    Users,
    ChevronLeft,
    Archive,
    CalendarPlus,
    CalendarCog,
    CalendarMinus,
    Workflow,
} from "lucide-react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import StatusIconLabel from "@/components/projects/status";
import PriorityIconLabel from "@/components/projects/priority";
import { calcPriorityComparison, calcStatusComparison } from "@/utils/projectUtils";
import { format } from "date-fns";
import { saveData } from "@/utils/save";
import Task from "@/models/task";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Project() {
    const { user, setUser } = useUser();

    const router = useRouter();

    const task = user?.projects
        .flatMap((project) => project.tasks)
        .find((task) => task.id === router.query.id);

    if (!task) {
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

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="flex items-center gap-4">
                    <Link href="/tasks" className="text-muted-foreground">
                        <Button variant="outline" size="icon" className="h-7 w-7">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Button>
                    </Link>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        {task.name}
                    </h1>
                    {task.priority && (
                        <Badge variant="outline" className="ml-auto sm:ml-0 py-2">
                            <PriorityIconLabel priorityValue={task.priority} />
                        </Badge>
                    )}
                    {task.status && (
                        <Badge variant="outline" className="ml-auto sm:ml-0 py-2">
                            <StatusIconLabel statusValue={task.status} />
                        </Badge>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                        <Link href={`/tasks/${task.id}/edit`}>
                            <Button size="sm">Edit Task</Button>
                        </Link>
                    </div>
                </div>
                {/* <div
                    className={`grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4`}
                >
                    <Card x-chunk="dashboard-01-chunk-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Creation</CardTitle>
                            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {!isNaN(Date.parse(String(project.createdAt)))
                                    ? format(Date.parse(String(project.createdAt)), "MMMM dd, yyyy")
                                    : "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {user &&
                                    user?.projects.filter(
                                        (proj) =>
                                            proj.createdAt &&
                                            Date.parse(String(proj.createdAt)) <
                                                Date.parse(String(project.createdAt))
                                    ).length +
                                        " project" +
                                        (user?.projects.filter(
                                            (proj) =>
                                                proj.createdAt &&
                                                Date.parse(String(proj.createdAt)) <
                                                    Date.parse(String(project.createdAt))
                                        ).length > 1
                                            ? "s"
                                            : "") +
                                        " created before this one"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
                            <CalendarCog className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {!isNaN(Date.parse(String(project.lastUpdatedAt)))
                                    ? format(
                                          Date.parse(String(project.lastUpdatedAt)),
                                          "MMMM dd, yyyy"
                                      )
                                    : "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {(
                                    (new Date(project.lastUpdatedAt).getTime() -
                                        new Date(project.createdAt).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                ).toFixed(0) + " days after creation"}
                            </p>
                        </CardContent>
                    </Card>
                    {project.archivedAt && (
                        <Card className="hidden xl:block" x-chunk="dashboard-01-chunk-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Deletion</CardTitle>
                                <CalendarMinus className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {!isNaN(Date.parse(String(project.archivedAt)))
                                        ? format(
                                              Date.parse(String(project.archivedAt)),
                                              "MMMM dd, yyyy"
                                          )
                                        : "N/A"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {user &&
                                        "One of " +
                                            user?.projects.filter((proj) => proj.archivedAt)
                                                .length +
                                            " archived project" +
                                            (user?.projects.filter((proj) => proj.archivedAt)
                                                .length > 1
                                                ? "s"
                                                : "")}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    <Card x-chunk="dashboard-01-chunk-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            <Workflow className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <StatusIconLabel statusValue={project.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {calcStatusComparison(user, project.status)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Priority</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <PriorityIconLabel priorityValue={project.priority} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {calcPriorityComparison(user, project.priority)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>Tasks</CardTitle>
                                <CardDescription>Recent tasks for this project.</CardDescription>
                            </div>
                            <Button asChild size="sm" className="ml-auto gap-1">
                                <Link href="/tasks">
                                    View All
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead className="text-right">Priority</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTasks.map((task, i) => {
                                        return (
                                            <TableRow
                                                key={i}
                                                onClick={() => router.push(`/tasks/${task.id}`)}
                                                className="cursor-pointer"
                                            >
                                                <TableCell>
                                                    <div className="font-medium">{task.name}</div>
                                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                                        {task.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <PriorityIconLabel
                                                        priorityValue={task.priority}
                                                        justify="right"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-5">
                        <CardHeader>
                            <CardTitle>Recent Sales</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-8">
                            <div className="flex items-center gap-4">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                    <AvatarFallback>OM</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        Olivia Martin
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        olivia.martin@email.com
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">+$1,999.00</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src="/avatars/02.png" alt="Avatar" />
                                    <AvatarFallback>JL</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">Jackson Lee</p>
                                    <p className="text-sm text-muted-foreground">
                                        jackson.lee@email.com
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">+$39.00</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src="/avatars/03.png" alt="Avatar" />
                                    <AvatarFallback>IN</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        Isabella Nguyen
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        isabella.nguyen@email.com
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">+$299.00</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src="/avatars/04.png" alt="Avatar" />
                                    <AvatarFallback>WK</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">William Kim</p>
                                    <p className="text-sm text-muted-foreground">will@email.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$99.00</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src="/avatars/05.png" alt="Avatar" />
                                    <AvatarFallback>SD</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">Sofia Davis</p>
                                    <p className="text-sm text-muted-foreground">
                                        sofia.davis@email.com
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">+$39.00</div>
                            </div>
                        </CardContent>
                    </Card>
                </div> */}
            </main>
        </div>
    );
}
