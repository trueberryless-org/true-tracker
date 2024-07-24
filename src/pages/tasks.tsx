import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ExtendedTask } from "@/models/task";

import { useUser } from "@/components/UserContext";
import { columnsLg, columnsMd, columnsMobile, columnsSm, columnsXl } from "@/components/tasks/columns";
import { DataTable } from "@/components/tasks/data-table";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Project, User } from "../models";
import { exportData } from "../utils/export";
import { importData } from "../utils/import";
import { loadData } from "../utils/load";
import { saveData } from "../utils/save";
import { getSessionStorageItem, setSessionStorageItem } from "../utils/sessionStorage";

export default function Tasks() {
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

    const data: ExtendedTask[] = user.projects
        .flatMap((project) => project.tasks)
        .map((task) => {
            const project = user.projects.find((project) => project.tasks.some((t: { id: any }) => t.id === task.id));
            return {
                ...task,
                projectName: project ? project.name : "Project Not Found",
                projectIsArchived: project ? project.archivedAt !== null : false,
                someSessionIsRunning: task.sessions.some((s) => s.end === null),
            };
        });

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="hidden h-full flex-1 flex-col xl:flex">
                    <DataTable
                        title="Tasks"
                        data={data}
                        columns={columnsXl}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col lg:flex xl:hidden">
                    <DataTable
                        title="Tasks"
                        data={data}
                        columns={columnsLg}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col md:flex lg:hidden">
                    <DataTable
                        title="Tasks"
                        data={data}
                        columns={columnsMd}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col sm:flex md:hidden">
                    <DataTable
                        title="Tasks"
                        data={data}
                        columns={columnsSm}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="flex h-full flex-1 flex-col sm:hidden">
                    <DataTable
                        title="Tasks"
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
