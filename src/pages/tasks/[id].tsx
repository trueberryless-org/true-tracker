import { Session } from "@/models";
import { format } from "date-fns";
import {
  Activity,
  Archive,
  ArrowUpRight,
  BadgeInfo,
  Book,
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
  Users,
  Workflow,
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Key, useEffect, useState } from "react";
import { toast } from "sonner";

import Task from "@/models/task";

import { formatDateTime, formatDateToDistanceFromNow } from "@/utils/dateUtils";
import { saveData } from "@/utils/save";
import {
  calcPriorityComparison,
  calcStatusComparison,
} from "@/utils/taskUtils";

import { useUser } from "@/components/UserContext";
import PriorityIconLabel from "@/components/tasks/priority";
import StartStopButton from "@/components/tasks/start-stop-button";
import StatusIconLabel from "@/components/tasks/status";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function TaskPage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  if (!task) {
    return (
      <div className="flex w-full flex-col">
        <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Loading...</AlertTitle>
            <AlertDescription>
              We are currently trying to fetch your data from your local
              storage.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const handleSessionChange = (taskId: string, newSession: Session) => {
    if (user) {
      const updatedProjects = user.projects.map((project) => {
        const updatedTasks = project.tasks.map((task: Task) => {
          if (task.id === taskId) {
            if (newSession.end === null) {
              // Start a new Session
              if (
                task.sessions.length === 0 &&
                (task.status === "backlog" || task.status === "todo")
              ) {
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
                  toast(
                    "We automatically moved your task and project to “In Progress”."
                  );
                } else if (taskMoved) {
                  toast("We automatically moved your task to “In Progress”.");
                } else if (projectMoved) {
                  toast(
                    "We automatically moved your project to “In Progress”."
                  );
                }
              }

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

  const gridColsClass = task.description ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <div className="flex w-full flex-col">
      <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="flex items-center gap-4 overflow-hidden min-h-9">
          <Link href="/tasks" className="text-muted-foreground">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight truncate">
            {task.name}
          </h1>
          {task.priority && (
            <Badge
              variant="outline"
              className="ml-auto sm:ml-0 py-2 bg-background max-xs:hidden"
            >
              <PriorityIconLabel
                priorityValue={task.priority}
                className="text-muted-foreground"
              />
            </Badge>
          )}
          {task.status && (
            <Badge
              variant="outline"
              className="ml-auto sm:ml-0 py-2 bg-background max-sm:hidden"
            >
              <StatusIconLabel
                statusValue={task.status}
                className="text-muted-foreground"
              />
            </Badge>
          )}
          {task.projectIsArchived && (
            <Badge
              variant="destructive"
              className="ml-auto sm:ml-0 py-2 max-md:hidden"
            >
              <div className="flex items-center">
                <Archive className="mr-2 h-4 w-4" />
                Archived by project
              </div>
            </Badge>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {!task.projectIsArchived && (
              <Link href={`/tasks/${task.id}/edit`}>
                <Button size="sm">Edit Task</Button>
              </Link>
            )}
            {task.projectIsArchived && (
              <Button size="sm" disabled>
                Edit Task
              </Button>
            )}
          </div>
        </div>
        <div className={`grid gap-4 md:grid-cols-2 md:gap-8 ${gridColsClass}`}>
          <Card
            className="cursor-pointer"
            x-chunk="dashboard-01-chunk-2"
            onClick={() => {
              router.push(`/projects/${task.projectId}`);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                Project
              </CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{task.projectName}</div>
              <p className="text-xs text-muted-foreground">
                Click to go to project.
              </p>
            </CardContent>
          </Card>
          {task.description && (
            <Card x-chunk="dashboard-01-chunk-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                  Description
                </CardTitle>
                <BadgeInfo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">
                  {task.description}
                </div>
                <p className="text-xs text-muted-foreground">
                  Now it makes sense!
                </p>
              </CardContent>
            </Card>
          )}
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                Status
              </CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <StatusIconLabel statusValue={task.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {calcStatusComparison(user, task.status)}
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                Priority
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <PriorityIconLabel priorityValue={task.priority} />
              </div>
              <p className="text-xs text-muted-foreground">
                {calcPriorityComparison(user, task.priority)}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {!task.projectIsArchived && (
            <div className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
              <Card>
                <CardHeader>Quick Session Control</CardHeader>
                <CardContent>
                  <StartStopButton
                    key={task.id}
                    task={task}
                    onSessionChange={handleSessionChange}
                    showElapsedTime={true}
                  ></StartStopButton>
                </CardContent>
              </Card>
            </div>
          )}
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Sessions</CardTitle>
                <CardDescription>
                  Recent sessions for this task.
                </CardDescription>
              </div>
              {task.projectIsArchived && (
                <Button
                  asChild
                  size="sm"
                  className="ml-auto gap-1"
                  variant={"outline"}
                >
                  <Link href={`/sessions?taskId=${task.id}`}>
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {!task.projectIsArchived && (
                <div className="ml-auto flex flex-row items-center gap-4">
                  <Button asChild size="sm" className="gap-1 max-md:hidden">
                    <Link href={`/sessions/new?taskId=${task.id}`}>
                      Create New Session
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="gap-1"
                    variant={"outline"}
                  >
                    <Link href={`/sessions?taskId=${task.id}`}>
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
                    <TableHead>Start</TableHead>
                    <TableHead className="text-right">End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {task.sessions
                    .sort(
                      (a: Session, b: Session) =>
                        new Date(b.start).getTime() -
                        new Date(a.start).getTime()
                    )
                    .slice(0, 3)
                    .map((session: Session, i: Key | null | undefined) => {
                      return (
                        <TableRow
                          key={i}
                          onClick={() => router.push(`/sessions/${session.id}`)}
                          className="cursor-pointer"
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
