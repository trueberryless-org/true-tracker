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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/components/UserContext";
import Project, { priorities, statuses } from "@/models/project";
import { useEffect, useState } from "react";
import { saveData } from "@/utils/save";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import StatusIconLabel from "@/components/projects/status";
import PriorityIconLabel from "@/components/projects/priority";

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
            const updatedProjects = user.projects.map((proj) =>
                proj.id === project.id ? project : proj
            );
            const updatedUser = { ...user, projects: updatedProjects };
            setUser(updatedUser);
            saveData(updatedUser);
            router.push(`/project/${project.id}`);
        }
    };

    if (!project) {
        return <div>Project not found</div>;
    }

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="grid flex-1 auto-rows-max gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/project/${project.id}`} className="text-muted-foreground">
                            <Button variant="outline" size="icon" className="h-7 w-7">
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Button>
                        </Link>
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            {project.name}
                        </h1>
                        <Badge variant="outline" className="ml-auto sm:ml-0 py-2">
                            <PriorityIconLabel priorityValue={project.priority} />
                        </Badge>
                        <Badge variant="outline" className="ml-auto sm:ml-0 py-2">
                            <StatusIconLabel statusValue={project.status} />
                        </Badge>
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <Link href={`/project/${project.id}`} className="text-muted-foreground">
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
                                    <CardDescription>
                                        Edit the name and description of the project.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                className="w-full"
                                                value={project.name}
                                                onChange={(e) =>
                                                    handleInputChange("name", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={project.description}
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
                                    <CardTitle>Project Status</CardTitle>
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
                        <Button variant="outline" size="sm">
                            Discard
                        </Button>
                        <Button size="sm" onClick={handleSaveProject}>
                            Save Project
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
