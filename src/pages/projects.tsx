import { useState, useEffect } from "react";
import Link from "next/link";

import { Project, User } from "../models";
import { saveData } from "../utils/save";
import { loadData } from "../utils/load";
import { importData } from "../utils/import";
import { exportData } from "../utils/export";
import { setSessionStorageItem, getSessionStorageItem } from "../utils/sessionStorage";

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
import { DataTable } from "@/components/projects/data-table";
import {
    columnsXl,
    columnsLg,
    columnsMd,
    columnsSm,
    columnsMobile,
    columnsXlWithArchivedAt,
} from "@/components/projects/columns";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getMostRecentTimeSpanDate } from "@/utils/projectUtils";

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

    const data = user.projects.filter((project) => !project.archivedAt);
    const archivedData = user.projects.filter((project) => project.archivedAt);
    const recentData = data
        .map((project) => ({
            ...project,
            mostRecentDate: getMostRecentTimeSpanDate(project),
        }))
        .sort((project1, project2) => project2.mostRecentDate - project1.mostRecentDate)
        .slice(0, 5);

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="hidden h-full flex-1 flex-col xl:flex">
                    <DataTable
                        title="Recent Projects"
                        data={recentData}
                        columns={columnsXl}
                        pagination={false}
                        clickableRows={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col lg:flex xl:hidden">
                    <DataTable
                        title="Recent Projects"
                        data={recentData}
                        columns={columnsLg}
                        pagination={false}
                        clickableRows={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col md:flex lg:hidden">
                    <DataTable
                        title="Recent Projects"
                        data={recentData}
                        columns={columnsMd}
                        pagination={false}
                        clickableRows={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col sm:flex md:hidden">
                    <DataTable
                        title="Recent Projects"
                        data={recentData}
                        columns={columnsSm}
                        pagination={false}
                        clickableRows={true}
                    />
                </div>
                <div className="flex h-full flex-1 flex-col sm:hidden">
                    <DataTable
                        title="Recent Projects"
                        data={recentData}
                        columns={columnsMobile}
                        pagination={false}
                        clickableRows={true}
                    />
                </div>

                <div className="hidden h-full flex-1 flex-col xl:flex">
                    <DataTable
                        title="All Active Projects"
                        data={data}
                        columns={columnsXl}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col lg:flex xl:hidden">
                    <DataTable
                        title="All Active Projects"
                        data={data}
                        columns={columnsLg}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col md:flex lg:hidden">
                    <DataTable
                        title="All Active Projects"
                        data={data}
                        columns={columnsMd}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col sm:flex md:hidden">
                    <DataTable
                        title="All Active Projects"
                        data={data}
                        columns={columnsSm}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="flex h-full flex-1 flex-col sm:hidden">
                    <DataTable
                        title="All Active Projects"
                        data={data}
                        columns={columnsMobile}
                        pagination={false}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>

                <div className="hidden h-full flex-1 flex-col xl:flex">
                    <DataTable
                        title="Archived Projects"
                        data={archivedData}
                        columns={columnsXlWithArchivedAt}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col lg:flex xl:hidden">
                    <DataTable
                        title="Archived Projects"
                        data={archivedData}
                        columns={columnsLg}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col md:flex lg:hidden">
                    <DataTable
                        title="Archived Projects"
                        data={archivedData}
                        columns={columnsMd}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="hidden h-full flex-1 flex-col sm:flex md:hidden">
                    <DataTable
                        title="Archived Projects"
                        data={archivedData}
                        columns={columnsSm}
                        pagination={true}
                        clickableRows={true}
                        filtering={true}
                    />
                </div>
                <div className="flex h-full flex-1 flex-col sm:hidden">
                    <DataTable
                        title="Archived Projects"
                        data={archivedData}
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
