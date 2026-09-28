import { AlertCircle, BadgeInfo, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

import Project, { priorities, statuses } from "@/models/project";

import { initializeProject } from "@/utils/projectUtils";
import { saveData } from "@/utils/save";

import { useUser } from "@/components/UserContext";
import PriorityIconLabel from "@/components/projects/priority";
import StatusIconLabel from "@/components/projects/status";

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

export default function NewProduct() {
  const { user, setUser } = useUser();
  const router = useRouter();

  // Initialize project once on mount using a lazy initializer function.
  // This removes the need for useEffect and prevent double-rendering on mount.
  const [project, setProject] = useState<Project>(() => initializeProject());

  const handleInputChange = (field: keyof Project, value: any) => {
    setProject((prevProject) => ({ ...prevProject, [field]: value }));
  };

  const handleSaveProject = () => {
    if (project && user) {
      const newProject = {
        ...project,
        lastUpdatedAt: new Date(),
      };

      const updatedUser = { ...user, projects: [...user.projects, newProject] };
      setUser(updatedUser);
      saveData(updatedUser);
      router.push(`/projects/${newProject.id}`);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="grid flex-1 auto-rows-max gap-4">
          <div className="flex items-center gap-4">
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {project.name || "New Project"}
            </h1>
            <Badge
              variant="outline"
              className="ml-auto sm:ml-0 py-2 bg-background"
            >
              <PriorityIconLabel
                priorityValue={project.priority}
                className="text-muted-foreground"
              />
            </Badge>
            <Badge
              variant="outline"
              className="ml-auto sm:ml-0 py-2 bg-background"
            >
              <StatusIconLabel
                statusValue={project.status}
                className="text-muted-foreground"
              />
            </Badge>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Link href={`/projects`} className="text-muted-foreground">
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
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Edit the name and description of the project.
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
                        value={project.id}
                        disabled
                      />
                    </div>
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
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center justify-between">
                      <div>Project Status</div>
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
                        value={project.status}
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
                  <CardTitle>Project Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={project.priority}
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
            <Link href={`/projects`} className="text-muted-foreground">
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
