import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import router from "next/router";
import { useEffect, useState } from "react";

import { ExtendedProject } from "@/models/project";

import { getMostRecentSessionDateOfProject } from "@/utils/projectUtils";

import { useUser } from "@/components/UserContext";
import {
    columnsLg,
    columnsMd,
    columnsMobile,
    columnsSm,
    columnsXl,
    columnsXlWithArchivedAt,
} from "@/components/projects/columns";
import { DataTable } from "@/components/projects/data-table";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Project, User } from "../models";
import { exportData } from "../utils/export";
import { importData } from "../utils/import";
import { loadData } from "../utils/load";
import { saveData } from "../utils/save";
import { getSessionStorageItem, setSessionStorageItem } from "../utils/sessionStorage";

export default function Projects() {
    const { user } = useUser();

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

    const data: ExtendedProject[] = user.projects
        .map((project) => {
            return {
                ...project,
                projectIsArchived: project.archivedAt ? true : false,
                mostRecentDate: getMostRecentSessionDateOfProject(project),
                someSessionIsRunning: project.tasks.some((task) => task.sessions.some((s) => s.end === null)),
            };
        })
        .sort((project1, project2) => project2.mostRecentDate.valueOf() - project1.mostRecentDate.valueOf());

    if (data.length === 0) {
        return (
            <div className="flex w-full flex-col">
                <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col items-center justify-center gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                    <Card className="sm:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle>Welcome to Your Project Dashboard</CardTitle>
                            <CardDescription className="max-w-xl text-balance leading-relaxed pt-2">
                                You currently have no projects set up. Start by creating your very first project! Your
                                projects will help you organize tasks and track their progress effectively. Each project
                                includes a name, description, status (planned, in progress, completed, etc.), priority
                                (low, medium, high), and a list of associated tasks. Begin by clicking the &quot;Create
                                New Project&quot; button below to get started.
                            </CardDescription>
                        </CardHeader>
                        <CardContent></CardContent>
                        <CardFooter>
                            <Button onClick={() => router.push("/projects/new")}>Create New Project</Button>
                        </CardFooter>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="hidden h-full flex-1 flex-col xl:flex">
                    <DataTable
                        title="Projects"
                        data={data}
                        columns={columnsXl}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col lg:flex xl:hidden">
                    <DataTable
                        title="Projects"
                        data={data}
                        columns={columnsLg}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col md:flex lg:hidden">
                    <DataTable
                        title="Projects"
                        data={data}
                        columns={columnsMd}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col sm:flex md:hidden">
                    <DataTable
                        title="Projects"
                        data={data}
                        columns={columnsSm}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="flex h-full flex-1 flex-col sm:hidden">
                    <DataTable
                        title="Projects"
                        data={data}
                        columns={columnsMobile}
                        pagination={false}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
            </main>
        </div>
    );
}
