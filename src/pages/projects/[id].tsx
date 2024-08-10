import { Project } from "@/models";
import { format } from "date-fns";
import {
    Activity,
    Archive,
    ArrowUpRight,
    Calculator,
    CalendarCog,
    CalendarMinus,
    CalendarPlus,
    ChevronLeft,
    CircleUser,
    CreditCard,
    DollarSign,
    Menu,
    Package2,
    Plus,
    Search,
    Timer,
    Users,
    Workflow,
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import Task from "@/models/task";

import {
    msToTime,
    msToTimeDaysOrSecondsLong,
    msToTimeFitting,
    msToTimeFittingLong,
    msToTimeHours,
} from "@/utils/dateUtils";
import { calcPriorityComparison, calcStatusComparison, getProjectDuration } from "@/utils/projectUtils";
import { saveData } from "@/utils/save";
import { getMostRecentSessionDateOfTask } from "@/utils/taskUtils";

import { useUser } from "@/components/UserContext";
import PriorityIconLabel from "@/components/projects/priority";
import StatusIconLabel from "@/components/projects/status";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProjectPage() {
    const { user, setUser } = useUser();

    const router = useRouter();

    const project = user?.projects.find((project) => project.id === router.query.id);

    const unarchiveProject = () => {
        if (user && project) {
            project.archivedAt = null;
            const updatedProjects = user.projects.map((proj) => (proj.id === project.id ? project : proj));
            const updatedUser = { ...user, projects: updatedProjects };
            setUser(updatedUser);
            saveData(updatedUser);
        }
    };

    if (!project) {
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

    const recentTasks: any[] = project.tasks
        .map((task: any) => ({
            ...task,
            mostRecentDate: getMostRecentSessionDateOfTask(task),
            isRunning: task.sessions.find((session: any) => session.end === null),
        }))
        .sort(
            (task1: { mostRecentDate: number }, task2: { mostRecentDate: number }) =>
                task2.mostRecentDate - task1.mostRecentDate,
        )
        .slice(0, 5);

    const gridColsClass = project.archivedAt ? "xl:grid-cols-5" : "xl:grid-cols-4";

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="flex items-center gap-4 min-h-9">
                    <Link href="/projects" className="text-muted-foreground">
                        <Button variant="outline" size="icon" className="h-7 w-7">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Button>
                    </Link>
                    <h1 className="truncate text-xl font-semibold tracking-tight">{project.name}</h1>
                    <Badge variant="outline" className="ml-auto sm:ml-0 py-2 max-xs:hidden bg-background">
                        <PriorityIconLabel priorityValue={project.priority} className="text-muted-foreground" />
                    </Badge>
                    <Badge variant="outline" className="ml-auto sm:ml-0 py-2 max-sm:hidden bg-background">
                        <StatusIconLabel statusValue={project.status} className="text-muted-foreground" />
                    </Badge>
                    {project.archivedAt && (
                        <Badge variant="destructive" className="ml-auto sm:ml-0 py-2 max-md:hidden">
                            <div className="flex items-center">
                                <Archive className="mr-2 h-4 w-4" />
                                Archived
                            </div>
                        </Badge>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                        {!project.archivedAt && (
                            <Link href={`/projects/${project.id}/edit`}>
                                <Button size="sm">Edit Project</Button>
                            </Link>
                        )}
                        {project.archivedAt && (
                            <Button onClick={unarchiveProject} size="sm" variant="outline">
                                Unarchive
                            </Button>
                        )}
                    </div>
                </div>
                <div className={`grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 ${gridColsClass}`}>
                    <Card x-chunk="dashboard-01-chunk-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Creation</CardTitle>
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
                                            Date.parse(String(proj.createdAt)) < Date.parse(String(project.createdAt)),
                                    ).length +
                                        " project" +
                                        (user?.projects.filter(
                                            (proj) =>
                                                proj.createdAt &&
                                                Date.parse(String(proj.createdAt)) <
                                                    Date.parse(String(project.createdAt)),
                                        ).length > 1
                                            ? "s"
                                            : "") +
                                        " created before this one"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Last Update</CardTitle>
                            <CalendarCog className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {!isNaN(Date.parse(String(project.lastUpdatedAt)))
                                    ? format(Date.parse(String(project.lastUpdatedAt)), "MMMM dd, yyyy")
                                    : "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {(
                                    (new Date(project.lastUpdatedAt!).getTime() -
                                        new Date(project.createdAt!).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                ).toFixed(0) + " days after creation"}
                            </p>
                        </CardContent>
                    </Card>
                    {project.archivedAt && (
                        <Card className="hidden xl:block" x-chunk="dashboard-01-chunk-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Deletion</CardTitle>
                                <CalendarMinus className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {!isNaN(Date.parse(String(project.archivedAt)))
                                        ? format(Date.parse(String(project.archivedAt)), "MMMM dd, yyyy")
                                        : "N/A"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {user &&
                                        "One of " +
                                            user?.projects.filter((proj) => proj.archivedAt).length +
                                            " archived project" +
                                            (user?.projects.filter((proj) => proj.archivedAt).length > 1 ? "s" : "")}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    <Card x-chunk="dashboard-01-chunk-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Status</CardTitle>
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
                            <CardTitle className="text-sm font-medium text-primary">Priority</CardTitle>
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
                    <Card className="xl:col-span-2 row-span-3 max-lg:order-1" x-chunk="dashboard-01-chunk-4">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="grid gap-2">
                                <CardTitle>Tasks</CardTitle>
                                <CardDescription>Recent tasks for this project.</CardDescription>
                            </div>
                            {project.archivedAt && (
                                <Button asChild size="sm" className="ml-auto gap-1" variant={"outline"}>
                                    <Link href={`/tasks?projectId=${project.id}`}>
                                        View All
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                            {!project.archivedAt && (
                                <div className="ml-auto flex flex-row items-center gap-4">
                                    <Button asChild size="sm" className="gap-1 max-md:hidden">
                                        <Link href={`/tasks/new?projectId=${project.id}`}>
                                            Create New Task
                                            <Plus className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" className="gap-1" variant={"outline"}>
                                        <Link href={`/tasks?projectId=${project.id}`}>
                                            View All
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
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
                                                    <div className="flex items-center space-x-2">
                                                        {task.isRunning && (
                                                            <Badge variant={"default"} className="px-3 py-1">
                                                                Running
                                                            </Badge>
                                                        )}
                                                        <div>
                                                            <div className="font-medium">{task.name}</div>
                                                            <div className="hidden text-sm text-muted-foreground md:inline">
                                                                {task.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <PriorityIconLabel priorityValue={task.priority} justify="right" />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Duration</CardTitle>
                            <Timer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{msToTime(getProjectDuration(project))}</div>
                            <p className="text-xs text-muted-foreground">
                                You could also say around {msToTimeDaysOrSecondsLong(getProjectDuration(project))}
                            </p>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Task Count</CardTitle>
                            <Calculator className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {project.tasks.length} task{project.tasks.length !== 1 && "s"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {project.tasks.filter((task) => task.priority === "high").length} task
                                {project.tasks.filter((task) => task.priority === "high").length !== 1 && "s"} with high
                                priority
                            </p>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Session Count</CardTitle>
                            <Calculator className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {project.tasks.flatMap((task) => task.sessions).length} session
                                {project.tasks.flatMap((task) => task.sessions).length !== 1 && "s"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {
                                    project.tasks
                                        .flatMap((task) => task.sessions)
                                        .filter((session) => session.flow === "smooth").length
                                }{" "}
                                session
                                {project.tasks
                                    .flatMap((task) => task.sessions)
                                    .filter((session) => session.flow === "smooth").length !== 1 && "s"}{" "}
                                with smooth flow
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
