import { AlertCircle, BadgeInfo, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Project, { priorities, statuses } from "@/models/project";

import { saveData } from "@/utils/save";

import { useUser } from "@/components/UserContext";
import PriorityIconLabel from "@/components/projects/priority";
import StatusIconLabel from "@/components/projects/status";

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

export default function EditProduct() {
    const { user, setUser } = useUser();
    const [project, setProject] = useState<Project | null>(null);
    const router = useRouter();
    const projectId = router.query.id as string;

    const [projectStatus, setProjectStatus] = useState<string>("");
    const [projectPriority, setProjectPriority] = useState<string>("");

    useEffect(() => {
        if (user) {
            const foundProject = user.projects.find((project) => project.id === projectId);
            setProject(foundProject || null);
            setProjectStatus(foundProject?.status || "");
            setProjectPriority(foundProject?.priority || "");
        }
    }, [user, projectId]);

    const handleInputChange = (field: keyof Project, value: any) => {
        setProject((prevProject) => (prevProject ? { ...prevProject, [field]: value } : null));
    };

    const handleSaveProject = () => {
        if (project && user) {
            project.lastUpdatedAt = new Date();

            const updatedUser = { ...user };
            updatedUser.projects = updatedUser.projects.map((p) => {
                return p.id === project.id ? project : p;
            });

            setUser(updatedUser);
            saveData(updatedUser);
            router.push(`/projects/${project.id}`);
        }
    };

    const archiveProject = () => {
        if (user && project) {
            project.archivedAt = new Date();

            if (user.settings.automation.archiveStopSessions) {
                project.tasks.forEach((task) => {
                    task.sessions.forEach((session) => {
                        if (session.end === null) session.end = new Date();
                    });
                });
            }

            if (user.settings.automation.archiveProjectStatusRetirement) {
                project.status = "completed";
            }

            if (user.settings.automation.archiveTaskStatusRetirement) {
                project.tasks.forEach((task) => {
                    task.status = "done";
                });
            }

            const updatedProjects = user.projects.map((proj) => (proj.id === project.id ? project : proj));
            const updatedUser = { ...user, projects: updatedProjects };
            setUser(updatedUser);
            saveData(updatedUser);
            router.push(`/projects/${project.id}`);
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

    if (project.archivedAt) {
        return (
            <div className="flex w-full flex-col">
                <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            This project has been archived. Please unarchive the project again, by clicking the button
                            in the top right of the project view!
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
                    <div className="flex items-center gap-4 overflow-hidden min-h-9">
                        <Link href={`/projects/${project.id}`} className="text-muted-foreground">
                            <Button variant="outline" size="icon" className="h-7 w-7">
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Button>
                        </Link>
                        <h1 className="text-xl font-semibold tracking-tight truncate">{project.name}</h1>
                        <Badge variant="outline" className="ml-auto sm:ml-0 py-2 bg-background max-xs:hidden">
                            <PriorityIconLabel priorityValue={project.priority} className="text-muted-foreground" />
                        </Badge>
                        <Badge variant="outline" className="ml-auto sm:ml-0 py-2 bg-background max-sm:hidden">
                            <StatusIconLabel statusValue={project.status} className="text-muted-foreground" />
                        </Badge>
                        <div className="flex max-md:hidden items-center gap-2 md:ml-auto">
                            <Link href={`/projects/${project.id}`} className="text-muted-foreground">
                                <Button variant="outline" size="sm">
                                    Discard
                                </Button>
                            </Link>
                            <Button size="sm" onClick={handleSaveProject}>
                                Save Project
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                            <Card x-chunk="dashboard-07-chunk-0">
                                <CardHeader>
                                    <CardTitle>Project Details</CardTitle>
                                    <CardDescription>Edit the name and description of the project.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Identifier</Label>
                                            <Input id="id" type="text" className="w-full" value={project.id} disabled />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                className="w-full"
                                                value={project.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={project.description}
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
                                            <div>Task Status</div>
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
                                                                We try to automate this status in order to help you
                                                                focus on your projects, not this app.
                                                            </p>
                                                            <div className="flex items-center pt-2">
                                                                <span className="text-xs text-muted-foreground">
                                                                    For example we will automatically move this task
                                                                    from “Planned” to “In Progress”, when you start
                                                                    working on it - when the first session is started.
                                                                </span>
                                                            </div>
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
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={projectStatus}
                                                onValueChange={(value) => {
                                                    setProjectStatus(value);
                                                    handleInputChange("status", value);
                                                }}
                                            >
                                                <SelectTrigger id="status" aria-label="Select status">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuses.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <StatusIconLabel statusValue={status.value} />
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
                                    <CardTitle>Project Priority</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select
                                                value={projectPriority}
                                                onValueChange={(value) => {
                                                    setProjectPriority(value);
                                                    handleInputChange("priority", value);
                                                }}
                                            >
                                                <SelectTrigger id="priority" aria-label="Select priority">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorities.map((priority) => (
                                                        <SelectItem key={priority.value} value={priority.value}>
                                                            <PriorityIconLabel priorityValue={priority.value} />
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
                                    <CardTitle>Archive Project</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <p>
                                                The archive is a place where no properties can be edited any more. You
                                                can still view the project and unarchive it again, but it will be
                                                locked. Archived projects will not be visible in the projects list.
                                            </p>
                                            <Button onClick={archiveProject} variant="destructive" size="sm">
                                                Archive
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 md:hidden">
                        <Link href={`/projects/${project.id}`} className="text-muted-foreground">
                            <Button variant="outline" size="sm">
                                Discard
                            </Button>
                        </Link>
                        <Button size="sm" onClick={handleSaveProject}>
                            Save Project
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
