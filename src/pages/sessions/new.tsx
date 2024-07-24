import { Session, Task } from "@/models";
import { AlertCircle, BadgeInfo, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import Project from "@/models/project";
import { flows } from "@/models/session";

import { saveData } from "@/utils/save";
import { initializeSession } from "@/utils/sessionUtils";

import { useUser } from "@/components/UserContext";
import FlowIconLabel from "@/components/sessions/flow";
import { TimePicker12 } from "@/components/time-picker/time-picker-12h";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NewSession() {
    const { user, setUser } = useUser();
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();

    const [task, setTask] = useState<Task | null>(null);
    const taskInputRef = useRef<HTMLButtonElement>(null);

    const [sessionFlow, setSessionFlow] = useState<string>("");
    const [start, setStart] = useState<Date>();
    const [end, setEnd] = useState<Date>();

    const tasks =
        user?.projects.filter((project) => project.archivedAt === null).flatMap((project) => project.tasks) || [];

    useEffect(() => {
        const newSession = initializeSession();
        setSession(newSession);
        setSessionFlow(newSession.flow);
        setStart(newSession.start);
        setEnd(newSession.end!);
        const taskId = router.query.taskId as string;
        if (taskId) {
            const task = user?.projects.flatMap((project) => project.tasks).find((t) => t.id === taskId) || null;
            setTask(task);
        }
    }, [router.query.taskId, user?.projects]);

    const handleInputChange = (field: keyof Session, value: any) => {
        setSession((prevSession) => (prevSession ? { ...prevSession, [field]: value } : null));
    };

    const handleSaveSession = () => {
        if (!task) {
            toast("Please select a task!");
            if (taskInputRef.current) {
                taskInputRef.current.focus();
            }
            return;
        }
        if (session && user) {
            const updatedUser = { ...user };
            updatedUser.projects = updatedUser.projects.map((project) => {
                const updatedTasks = project.tasks.map((task) => {
                    const updatedSessions = [...task.sessions, session];
                    return { ...task, sessions: updatedSessions };
                });
                return { ...project, tasks: updatedTasks };
            });

            setUser(updatedUser);
            saveData(updatedUser);
            router.push(`/sessions/${session.id}`);
        }
    };

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

    function handleStartChange(date: Date | undefined): void {
        setStart(date);
        handleInputChange("start", date);
    }

    function handleEndChange(date: Date | undefined): void {
        setEnd(date);
        handleInputChange("end", date);
    }

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="grid flex-1 auto-rows-max gap-4">
                    <div className="flex items-center gap-4">
                        {session.flow && (
                            <Badge variant="outline" className="ml-auto sm:ml-0 py-2 bg-background">
                                <FlowIconLabel flowValue={session.flow} className="text-muted-foreground" />
                            </Badge>
                        )}
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                size="sm"
                                className="text-muted-foreground"
                            >
                                Discard
                            </Button>
                            <Button size="sm" onClick={handleSaveSession}>
                                Save Session
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                            <Card x-chunk="dashboard-07-chunk-0">
                                <CardHeader>
                                    <CardTitle>Session Details</CardTitle>
                                    <CardDescription>Edit the description of the session.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Identifier</Label>
                                            <Input id="id" type="text" className="w-full" value={session.id} disabled />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="task">Task</Label>
                                            <Select
                                                value={task?.id}
                                                onValueChange={(value) => {
                                                    const selectedTask = tasks.find((t) => t.id === value);
                                                    setTask(selectedTask || null);
                                                }}
                                            >
                                                <SelectTrigger id="task" aria-label="Select task" ref={taskInputRef}>
                                                    <SelectValue placeholder="Select task">
                                                        {task ? task.name : "Select task"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tasks.map((task) => (
                                                        <SelectItem key={task.id} value={task.id}>
                                                            {task.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={session.description}
                                                onChange={(e) => handleInputChange("description", e.target.value)}
                                                className="min-h-36"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                            <Card x-chunk="dashboard-07-chunk-3">
                                <CardHeader>
                                    <CardTitle>
                                        <div className="flex items-center justify-between">
                                            <div>Session Flow</div>
                                            {/* <HoverCard>
                                                <HoverCardTrigger asChild>
                                                    <BadgeInfo className="h-5 w-5 text-primary" />
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-80" align="end">
                                                    <div className="flex justify-between space-x-4">
                                                        <Avatar>
                                                            <AvatarImage src="https://github.com/trueberryless.png" />
                                                            <AvatarFallback>T</AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-1">
                                                            <h4 className="text-sm font-semibold">
                                                                @trueberryless
                                                            </h4>
                                                            <p className="text-sm">
                                                                We try to automate this flow in
                                                                order to help you focus on your
                                                                projects, not this app.
                                                            </p>
                                                            <div className="flex items-center pt-2">
                                                                <span className="text-xs text-muted-foreground">
                                                                    For example we will
                                                                    automatically move this session
                                                                    from “Backlog” to “In Progress”,
                                                                    when you start working on it -
                                                                    when the first session is
                                                                    started.
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard> */}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="flow">Flow</Label>
                                            <Select
                                                value={sessionFlow}
                                                onValueChange={(value) => {
                                                    setSessionFlow(value);
                                                    handleInputChange("flow", value);
                                                }}
                                            >
                                                <SelectTrigger id="flow" aria-label="Select flow">
                                                    <SelectValue placeholder="Select flow" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {flows.map((flow) => (
                                                        <SelectItem key={flow.value} value={flow.value}>
                                                            <FlowIconLabel flowValue={flow.value} />
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card x-chunk="dashboard-07-chunk-3">
                                <CardHeader>
                                    <CardTitle>
                                        <div className="flex items-center justify-between">
                                            <div>Session Start Time</div>
                                            <HoverCard>
                                                <HoverCardTrigger asChild>
                                                    <BadgeInfo className="h-5 w-5 text-primary" />
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-80" align="end">
                                                    <div className="flex justify-between space-x-4">
                                                        <Avatar>
                                                            <AvatarImage src="https://github.com/trueberryless.png" />
                                                            <AvatarFallback>T</AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-1">
                                                            <h4 className="text-sm font-semibold">@trueberryless</h4>
                                                            <p className="text-sm">
                                                                We automatically assume that the session lasted for
                                                                three hours.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <TimePicker12 date={start} setDate={handleStartChange} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card x-chunk="dashboard-07-chunk-3">
                                <CardHeader>
                                    <CardTitle>
                                        <div className="flex items-center justify-between">
                                            <div>Session End Time</div>
                                            <HoverCard>
                                                <HoverCardTrigger asChild>
                                                    <BadgeInfo className="h-5 w-5 text-primary" />
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-80" align="end">
                                                    <div className="flex justify-between space-x-4">
                                                        <Avatar>
                                                            <AvatarImage src="https://github.com/trueberryless.png" />
                                                            <AvatarFallback>T</AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-1">
                                                            <h4 className="text-sm font-semibold">@trueberryless</h4>
                                                            <p className="text-sm">
                                                                We automatically assume that manually added sessions
                                                                ended right now.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <TimePicker12 date={end} setDate={handleEndChange} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 md:hidden">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground"
                        >
                            Discard
                        </Button>
                        <Button size="sm" onClick={handleSaveSession}>
                            Save Session
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
