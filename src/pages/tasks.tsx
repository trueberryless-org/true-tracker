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
import { toast } from "@/components/ui/use-toast";
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
import { DataTable } from "@/components/tasks/data-table";
import {
    columnsXl,
    columnsLg,
    columnsMd,
    columnsSm,
    columnsMobile,
} from "@/components/tasks/columns";

export default function Settings() {
    const { user, setUser } = useUser();

    useEffect(() => {
        const data = loadData();
        if (data) {
            setUser(data);
        }
    }, []);

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
        .map((task) => {
            const project = user.projects.find((project) =>
                project.tasks.some((t: { id: any }) => t.id === task.id)
            );
            return {
                ...task,
                projectName: project ? project.name : "Project Not Found",
            };
        });

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="hidden h-full flex-1 flex-col xl:flex">
                    <Card>
                        <CardHeader>Tasks</CardHeader>
                        <CardContent>
                            <DataTable
                                data={data}
                                columns={columnsXl}
                                pagination={true}
                                clickableRows={true}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="hidden h-full flex-1 flex-col lg:flex xl:hidden">
                    <Card>
                        <CardHeader>Tasks</CardHeader>
                        <CardContent>
                            <DataTable
                                data={data}
                                columns={columnsLg}
                                pagination={true}
                                clickableRows={true}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="hidden h-full flex-1 flex-col md:flex lg:hidden">
                    <Card>
                        <CardHeader>Tasks</CardHeader>
                        <CardContent>
                            <DataTable
                                data={data}
                                columns={columnsMd}
                                pagination={true}
                                clickableRows={true}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="hidden h-full flex-1 flex-col sm:flex md:hidden">
                    <Card>
                        <CardHeader>Tasks</CardHeader>
                        <CardContent>
                            <DataTable
                                data={data}
                                columns={columnsSm}
                                pagination={true}
                                clickableRows={true}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="flex h-full flex-1 flex-col sm:hidden">
                    <Card>
                        <CardHeader>Tasks</CardHeader>
                        <CardContent>
                            <DataTable
                                data={data}
                                columns={columnsMobile}
                                pagination={false}
                                clickableRows={true}
                            />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
