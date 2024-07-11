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
import { useEffect, useRef, useState } from "react";
import { saveData } from "@/utils/save";
import Link from "next/link";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Task } from "@/models";
import { priorities, statuses } from "@/models/task";
import PriorityIconLabel from "@/components/tasks/priority";
import StatusIconLabel from "@/components/tasks/status";
import { getProject, initializeTask } from "@/utils/taskUtils";
import { toast } from "sonner";

export default function NewTask() {
    const { user, setUser } = useUser();
    const [task, setTask] = useState<Task | null>(null);
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const projectInputRef = useRef<HTMLButtonElement>(null);

    const [taskStatus, setTaskStatus] = useState<string>("");
    const [taskPriority, setTaskPriority] = useState<string>("");

    const projects = user?.projects.filter((project) => project.archivedAt === null) || [];

    useEffect(() => {
        const newTask = initializeTask();
        setTask(newTask);
        setTaskStatus(newTask.status);
        setTaskPriority(newTask.priority);
        const projectId = router.query.projectId as string;
        if (projectId) {
            const project = user?.projects.find((p) => p.id === projectId) || null;
            setProject(project);
        }
    }, []);

    const handleInputChange = (field: keyof Task, value: any) => {
        setTask((prevTask) => (prevTask ? { ...prevTask, [field]: value } : null));
    };

    const handleSaveTask = () => {
        if (!project) {
            toast("Please select a project!");
            if (projectInputRef.current) {
                projectInputRef.current.focus();
            }
            return;
        }
        if (task && user) {
            const updatedProject = { ...project, tasks: [...project.tasks, task] };
            const updatedProjects = user.projects.map((proj) =>
                proj.id === project.id ? updatedProject : proj
            );
            const updatedUser = { ...user, projects: updatedProjects };
            setUser(updatedUser);
            saveData(updatedUser);
            router.push(`/tasks/${task.id}`);
        }
    };

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
                <div className="grid flex-1 auto-rows-max gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            {task.name}
                        </h1>
                        {task.priority && (
                            <Badge variant="outline" className="ml-auto sm:ml-0 py-2 bg-background">
                                <PriorityIconLabel
                                    priorityValue={task.priority}
                                    className="text-muted-foreground"
                                />
                            </Badge>
                        )}
                        {task.status && (
                            <Badge variant="outline" className="ml-auto sm:ml-0 py-2 bg-background">
                                <StatusIconLabel
                                    statusValue={task.status}
                                    className="text-muted-foreground"
                                />
                            </Badge>
                        )}
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <Button
                                onClick={() => router.back}
                                variant="outline"
                                size="sm"
                                className="text-muted-foreground"
                            >
                                Discard
                            </Button>
                            <Button size="sm" onClick={handleSaveTask}>
                                Save Task
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                            <Card x-chunk="dashboard-07-chunk-0">
                                <CardHeader>
                                    <CardTitle>Task Details</CardTitle>
                                    <CardDescription>
                                        Edit the name and description of the task.
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
                                                value={task.id}
                                                disabled
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="project">Project</Label>
                                            <Select
                                                value={project?.id}
                                                onValueChange={(value) => {
                                                    const selectedProject = projects.find(
                                                        (proj) => proj.id === value
                                                    );
                                                    setProject(selectedProject || null);
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="project"
                                                    aria-label="Select project"
                                                    ref={projectInputRef}
                                                >
                                                    <SelectValue placeholder="Select project">
                                                        {project ? project.name : "Select project"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {projects.map((project) => (
                                                        <SelectItem
                                                            key={project.id}
                                                            value={project.id}
                                                        >
                                                            {project.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                className="w-full"
                                                value={task.name}
                                                onChange={(e) =>
                                                    handleInputChange("name", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={task.description}
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
                                    <CardTitle>Task Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={taskStatus}
                                                onValueChange={(value) => {
                                                    setTaskStatus(value);
                                                    handleInputChange("status", value);
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="status"
                                                    aria-label="Select status"
                                                >
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuses.map((status) => (
                                                        <SelectItem
                                                            key={status.value}
                                                            value={status.value}
                                                        >
                                                            <StatusIconLabel
                                                                statusValue={status.value}
                                                            />
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
                                    <CardTitle>Task Priority</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select
                                                value={taskPriority}
                                                onValueChange={(value) => {
                                                    setTaskPriority(value);
                                                    handleInputChange("priority", value);
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="priority"
                                                    aria-label="Select priority"
                                                >
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorities.map((priority) => (
                                                        <SelectItem
                                                            key={priority.value}
                                                            value={priority.value}
                                                        >
                                                            <PriorityIconLabel
                                                                priorityValue={priority.value}
                                                            />
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
                        <Link href={`/tasks/${task.id}`} className="text-muted-foreground">
                            <Button variant="outline" size="sm">
                                Discard
                            </Button>
                        </Link>
                        <Button size="sm" onClick={handleSaveTask}>
                            Save Task
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
