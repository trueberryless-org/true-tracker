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
    Plus,
    Book,
    ClipboardCheck,
    Clock9,
} from "lucide-react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { saveData } from "@/utils/save";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import FlowIconLabel from "@/components/sessions/flow";
import { calcFlowComparison, calcDurationComparison } from "@/utils/sessionUtils";
import { msToShortTime, msToTimeFitting } from "@/utils/dateUtils";

export default function SessionPage() {
    const { user, setUser } = useUser();

    const router = useRouter();

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

    const foundSession = user?.projects
        .flatMap((project) => project.tasks.flatMap((task) => task.sessions))
        ?.find((session) => session.id === router.query.id);

    const session = foundSession
        ? {
              ...foundSession,
              projectName:
                  user?.projects.find((project) =>
                      project.tasks.some((task) =>
                          task.sessions.some((s) => s.id === foundSession.id)
                      )
                  )?.name || "Project Not Found",
              projectId:
                  user?.projects.find((project) =>
                      project.tasks.some((task) =>
                          task.sessions.some((s) => s.id === foundSession.id)
                      )
                  )?.id || undefined,
              projectIsArchived:
                  user?.projects.find((project) =>
                      project.tasks.some((task) =>
                          task.sessions.some((s) => s.id === foundSession.id)
                      )
                  )?.archivedAt !== null,
              taskName:
                  user?.projects
                      .flatMap((project) => project.tasks)
                      .find((task) => task.sessions.some((s) => s.id === foundSession.id))?.name ||
                  "Task Not Found",
              taskId:
                  user?.projects
                      .flatMap((project) => project.tasks)
                      .find((task) => task.sessions.some((s) => s.id === foundSession.id))?.id ||
                  undefined,
          }
        : undefined;

    if (!session) {
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

    const project = user?.projects.find((project) =>
        project.tasks.some((task) => task.sessions.some((s) => s.id === session.id))
    );

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

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="flex items-center gap-4">
                    <Link href="/sessions" className="text-muted-foreground">
                        <Button variant="outline" size="icon" className="h-7 w-7">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Button>
                    </Link>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        {msToTimeFitting(
                            session.end
                                ? new Date(session.end!).getTime() -
                                      new Date(session.start).getTime()
                                : Date.now() - new Date(session.start).getTime()
                        ) + " session"}
                    </h1>
                    <Badge variant="outline" className="ml-auto sm:ml-0 py-2 bg-background">
                        <FlowIconLabel flowValue={session.flow} className="text-muted-foreground" />
                    </Badge>
                    <div className="flex items-center gap-2 ml-auto">
                        {!session.projectIsArchived && (
                            <Link href={`/sessions/${session.id}/edit`}>
                                <Button size="sm">Edit Session</Button>
                            </Link>
                        )}
                        {session.projectIsArchived && (
                            <Button size="sm" disabled>
                                Edit Session
                            </Button>
                        )}
                    </div>
                </div>
                <div className={`grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4`}>
                    <Card
                        className="cursor-pointer"
                        x-chunk="dashboard-01-chunk-2"
                        onClick={() => {
                            router.push(`/projects/${session.projectId}`);
                        }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">
                                Project
                            </CardTitle>
                            <Book className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{session.projectName}</div>
                            <p className="text-xs text-muted-foreground">Click to go to project.</p>
                        </CardContent>
                    </Card>
                    <Card
                        className="cursor-pointer"
                        x-chunk="dashboard-01-chunk-2"
                        onClick={() => {
                            router.push(`/tasks/${session.taskId}`);
                        }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Task</CardTitle>
                            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{session.taskName}</div>
                            <p className="text-xs text-muted-foreground">Click to go to task.</p>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">
                                Duration
                            </CardTitle>
                            <Clock9 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {msToShortTime(
                                    session.end
                                        ? new Date(session.end!).getTime() -
                                              new Date(session.start).getTime()
                                        : Date.now() - new Date(session.start).getTime()
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {calcDurationComparison(user, session)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card x-chunk="dashboard-01-chunk-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">Flow</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <FlowIconLabel flowValue={session.flow} />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {calcFlowComparison(user, session.flow)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
