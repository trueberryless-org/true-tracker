import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/components/UserContext";
import Project from "@/models/project";
import { useEffect, useState } from "react";
import { saveData } from "@/utils/save";
import Link from "next/link";
import { AlertCircle, BadgeInfo, ChevronLeft } from "lucide-react";
import { Session } from "@/models";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FlowIconLabel from "@/components/sessions/flow";
import { flows } from "@/models/session";

export default function EditSession() {
    const { user, setUser } = useUser();
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();

    const [sessionFlow, setSessionFlow] = useState<string>("");

    useEffect(() => {
        if (user) {
            const foundSession = user?.projects
                .flatMap((project) => project.tasks)
                .flatMap((task) => task.sessions)
                .find((session) => session.id === router.query.id);
            setSession(foundSession || null);
            setSessionFlow(foundSession?.flow || "");
        }
    }, [user, router.query.id]);

    const handleInputChange = (field: keyof Session, value: any) => {
        setSession((prevSession) => (prevSession ? { ...prevSession, [field]: value } : null));
    };

    const handleSaveSession = () => {
        if (session && user) {
            const updatedUser = { ...user };
            updatedUser.projects = updatedUser.projects.map((project) => {
                const updatedTasks = project.tasks.map((task) => {
                    const updatedSessions = task.sessions.map((s) =>
                        s.id === session.id ? session : s
                    );
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

    if (
        user?.projects.find((project) =>
            project.tasks.some((task) =>
                task.sessions.some((session) => session.id === router.query.id)
            )
        )?.archivedAt !== null
    ) {
        return (
            <div className="flex w-full flex-col">
                <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            This task belongs to a project that has been archived. Please unarchive
                            the project again, by clicking the button in the top right of the
                            project view!
                        </AlertDescription>
                    </Alert>
                </main>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="grid flex-1 auto-rows-max gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/sessions/${session.id}`} className="text-muted-foreground">
                            <Button variant="outline" size="icon" className="h-7 w-7">
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Button>
                        </Link>
                        {session.flow && (
                            <Badge variant="outline" className="ml-auto sm:ml-0 py-2 bg-background">
                                <FlowIconLabel
                                    flowValue={session.flow}
                                    className="text-muted-foreground"
                                />
                            </Badge>
                        )}
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <Link
                                href={`/sessions/${session.id}`}
                                className="text-muted-foreground"
                            >
                                <Button variant="outline" size="sm">
                                    Discard
                                </Button>
                            </Link>
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
                                    <CardDescription>
                                        Edit the description of the session.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Identifier</Label>
                                            <Input
                                                id="id"
                                                type="text"
                                                className="w-full"
                                                value={session.id}
                                                disabled
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={session.description}
                                                onChange={(e) =>
                                                    handleInputChange("description", e.target.value)
                                                }
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
                                                        <SelectItem
                                                            key={flow.value}
                                                            value={flow.value}
                                                        >
                                                            <FlowIconLabel flowValue={flow.value} />
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 md:hidden">
                        <Link href={`/sessions/${session.id}`} className="text-muted-foreground">
                            <Button variant="outline" size="sm">
                                Discard
                            </Button>
                        </Link>
                        <Button size="sm" onClick={handleSaveSession}>
                            Save Session
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
