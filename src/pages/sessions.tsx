import { useState, useEffect } from "react";
import Link from "next/link";

import { Project, User } from "../models";
import { saveData } from "../utils/save";
import { loadData } from "../utils/load";
import { importData } from "../utils/import";
import { exportData } from "../utils/export";
import { setSessionStorageItem, getSessionStorageItem } from "../utils/sessionStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/UserContext";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTable } from "@/components/sessions/data-table";
import {
    columnsXl,
    columnsLg,
    columnsMd,
    columnsSm,
    columnsMobile,
} from "@/components/sessions/columns";

export default function Sessions() {
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

    const data = user.projects
        .flatMap((project) => project.tasks)
        .flatMap((task) => task.sessions)
        .map((session) => {
            const project = user.projects.find((project) =>
                project.tasks.some((task) => task.sessions.some((s) => s.id === session.id))
            );
            const task = user.projects
                .flatMap((project) => project.tasks)
                .find((task) => task.sessions.some((s) => s.id === session.id));
            return {
                ...session,
                projectName: project ? project.name : "Project Not Found",
                projectIsArchived: project ? project.archivedAt !== null : false,
                taskName: task ? task.name : "Task Not Found",
            };
        });

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="hidden h-full flex-1 flex-col xl:flex">
                    <DataTable
                        title="Sessions"
                        data={data}
                        columns={columnsXl}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col lg:flex xl:hidden">
                    <DataTable
                        title="Sessions"
                        data={data}
                        columns={columnsLg}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col md:flex lg:hidden">
                    <DataTable
                        title="Sessions"
                        data={data}
                        columns={columnsMd}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col sm:flex md:hidden">
                    <DataTable
                        title="Sessions"
                        data={data}
                        columns={columnsSm}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="flex h-full flex-1 flex-col sm:hidden">
                    <DataTable
                        title="Sessions"
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