import { Task } from "@/models";
import { AlertCircle, BadgeInfo, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import Project from "@/models/project";
import { priorities, statuses } from "@/models/task";

import { saveData } from "@/utils/save";
import { initializeTask } from "@/utils/taskUtils";

import { useUser } from "@/components/UserContext";
import PriorityIconLabel from "@/components/tasks/priority";
import StatusIconLabel from "@/components/tasks/status";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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

export default function NewTask() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const projectInputRef = useRef<HTMLButtonElement>(null);

  // 1. Initialize task once on mount using a lazy initializer
  const [task, setTask] = useState<Task>(() => initializeTask());

  // 2. Derive project from user data and router query instead of using useEffect
  const projects = useMemo(
    () => user?.projects.filter((project) => project.archivedAt === null) || [],
    [user?.projects]
  );

  const projectIdFromQuery = router.query.projectId as string;

  // Local state for manually selected project, defaulting to query param if exists
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  // Determine which project is currently active
  const activeProjectId = selectedProjectId || projectIdFromQuery;
  const project = projects.find((p) => p.id === activeProjectId) || null;

  const handleInputChange = (field: keyof Task, value: any) => {
    setTask((prevTask) => ({ ...prevTask, [field]: value }));
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

  return (
    <div className="flex w-full flex-col">
      <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="grid flex-1 auto-rows-max gap-4">
          <div className="flex items-center gap-4">
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {task.name || "New Task"}
            </h1>
            {task.priority && (
              <Badge
                variant="outline"
                className="ml-auto sm:ml-0 py-2 bg-background"
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
                className="ml-auto sm:ml-0 py-2 bg-background"
              >
                <StatusIconLabel
                  statusValue={task.status}
                  className="text-muted-foreground"
                />
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
              <Button size="sm" onClick={handleSaveTask}>
                Save Task
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                  <CardDescription>
                    Edit the name and description of the task.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="id">Identifier</Label>
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
                        value={project?.id || ""}
                        onValueChange={(value) => setSelectedProjectId(value)}
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
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
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
              <Card>
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
                              <h4 className="text-sm font-semibold">
                                @trueberryless
                              </h4>
                              <p className="text-sm">
                                We try to automate this status in order to help
                                you focus on your projects, not this app.
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
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={task.status}
                        onValueChange={(value) =>
                          handleInputChange("status", value)
                        }
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
              <Card>
                <CardHeader>
                  <CardTitle>Task Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={task.priority}
                        onValueChange={(value) =>
                          handleInputChange("priority", value)
                        }
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
            <Button
              onClick={() => router.back()}
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
      </main>
    </div>
  );
}
