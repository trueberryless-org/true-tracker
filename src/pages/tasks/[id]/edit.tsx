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
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Task } from "@/models";
import { getProject, priorities, statuses } from "@/models/task";
import PriorityIconLabel from "@/components/tasks/priority";
import StatusIconLabel from "@/components/tasks/status";

export default function EditProduct() {
    const { user, setUser } = useUser();
    const [task, setTask] = useState<Task | null>(null);
    const router = useRouter();
    const taskId = router.query.id as string;

    const [taskStatus, setTaskStatus] = useState<string>("");
    const [taskPriority, setTaskPriority] = useState<string>("");

    useEffect(() => {
        if (user) {
            const foundTask = user?.projects
                .flatMap((project) => project.tasks)
                .find((task) => task.id === taskId);
            setTask(foundTask || null);
            setTaskStatus(foundTask?.status || "");
            setTaskPriority(foundTask?.priority || "");
        }
    }, [user, taskId]);

    const handleInputChange = (field: keyof Task, value: any) => {
        setTask((prevTask) => (prevTask ? { ...prevTask, [field]: value } : null));
    };

    const handleSaveTask = () => {
        if (task && user) {
            const project = getProject(task);
            if (project) {
                const updatedTasks = project.tasks.map((t) => (t.id === task.id ? task : t));
                const updatedProject = { ...project, tasks: updatedTasks };
                const updatedProjects = user.projects.map((proj) =>
                    proj.id === project.id ? updatedProject : proj
                );
                const updatedUser = { ...user, projects: updatedProjects };
                setUser(updatedUser);
                saveData(updatedUser);
                router.push(`/tasks/${task.id}`);
            }
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
                        <Link href={`/tasks/${task.id}`} className="text-muted-foreground">
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
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
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
