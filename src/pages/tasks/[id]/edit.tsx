import { Task } from "@/models";
import { AlertCircle, BadgeInfo, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import Project from "@/models/project";
import { priorities, statuses } from "@/models/task";

import { saveData } from "@/utils/save";

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function EditTask() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const taskId = router.query.id as string;

  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState<boolean>(false);
  const [deleteDialogMobileIsOpen, setDeleteDialogMobileIsOpen] =
    useState<boolean>(false);

  // 1. Initialize task state lazily from the user data.
  // This happens once and avoids an Effect-based re-render.
  const [task, setTask] = useState<Task | null>(() => {
    if (!user || !taskId) return null;
    return (
      user.projects
        .flatMap((project) => project.tasks)
        .find((t) => t.id === taskId) || null
    );
  });

  // 2. Derive the project data directly from the current state/user context
  const parentProject = useMemo(() => {
    if (!user || !task) return null;
    return user.projects.find((project) =>
      project.tasks.some((t) => t.id === task.id)
    );
  }, [user, task]);

  const handleInputChange = (field: keyof Task, value: any) => {
    setTask((prevTask) => (prevTask ? { ...prevTask, [field]: value } : null));
  };

  const handleSaveTask = () => {
    if (task && user) {
      const updatedProjects = user.projects.map((project) => {
        const isTargetProject = project.tasks.some((t) => t.id === task.id);
        if (!isTargetProject) return project;

        const updatedTasks = project.tasks.map((t) =>
          t.id === task.id ? task : t
        );
        return { ...project, tasks: updatedTasks };
      });

      const updatedUser = { ...user, projects: updatedProjects };
      setUser(updatedUser);
      saveData(updatedUser);
      router.push(`/tasks/${task.id}`);
    }
  };

  const handleDeleteTask = () => {
    if (task && user) {
      const updatedProjects = user.projects.map((project) => {
        const updatedTasks = project.tasks.filter((t) => t.id !== task.id);
        return { ...project, tasks: updatedTasks };
      });

      const updatedUser = { ...user, projects: updatedProjects };
      setUser(updatedUser);
      saveData(updatedUser);
      router.push("/tasks");
    }
  };

  // UI States
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

  if (parentProject?.archivedAt) {
    return (
      <div className="flex w-full flex-col">
        <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              This task belongs to a project that has been archived. Please
              unarchive the project again, by clicking the button in the top
              right of the project view!
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="flex items-center gap-4 overflow-hidden min-h-9">
          <Link href={`/tasks/${task.id}`} className="text-muted-foreground">
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
          <div className="flex items-center gap-2 md:ml-auto max-md:hidden">
            <Dialog
              open={deleteDialogIsOpen}
              onOpenChange={setDeleteDialogIsOpen}
            >
              <DialogTrigger asChild>
                <Button variant={"destructive"} size={"sm"}>
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your task {task.name} and remove this data from your local
                    storage.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant={"outline"}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleDeleteTask}>Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                      <SelectTrigger id="priority" aria-label="Select priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            <PriorityIconLabel priorityValue={priority.value} />
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
          <Dialog
            open={deleteDialogMobileIsOpen}
            onOpenChange={setDeleteDialogMobileIsOpen}
          >
            <DialogTrigger asChild>
              <Button variant={"destructive"} size={"sm"}>
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your task {task.name} and remove this data from your local
                  storage.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={"outline"}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleDeleteTask}>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Link href={`/tasks/${task.id}`} className="text-muted-foreground">
            <Button variant="outline" size="sm">
              Discard
            </Button>
          </Link>
          <Button size="sm" onClick={handleSaveTask}>
            Save Task
          </Button>
        </div>
      </main>
    </div>
  );
}
