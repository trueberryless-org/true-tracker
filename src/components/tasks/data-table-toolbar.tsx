"use client";

import { Task } from "@/models";
import { Table } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { useEffect } from "react";

import Project from "@/models/project";
import { priorities, statuses } from "@/models/task";

import { loadData } from "@/utils/load";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useUser } from "../UserContext";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableFacetedFilterSimple } from "./data-table-faceted-filter-simple";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    setNewQueryParams: React.Dispatch<React.SetStateAction<string>>;
    setOnlyArchivedTasks: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DataTableToolbar<TData>({
    table,
    setNewQueryParams,
    setOnlyArchivedTasks,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const { user } = useUser();

    let projects: string[] = [];
    if (user && user.projects) {
        const projectNames = user.projects.map((project: Project) => project.name);
        for (const name of projectNames) {
            if (!projects.includes(name)) {
                projects.push(name);
            }
        }
    }

    const handleFilterChange = (filterValues: string[]) => {
        const projectNameColumn = table.getColumn("projectName");
        if (projectNameColumn && filterValues.length === 1) {
            const project = user?.projects.find((project) => project.name === filterValues[0]);
            if (project) {
                setNewQueryParams(`?projectId=${project.id}`);
                if (project.archivedAt) {
                    setOnlyArchivedTasks(true);
                }
            } else {
                setNewQueryParams("");
                setOnlyArchivedTasks(false);
            }
        } else {
            setNewQueryParams("");
            setOnlyArchivedTasks(false);
        }
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter tasks..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("projectName") && (
                    <DataTableFacetedFilterSimple
                        column={table.getColumn("projectName")}
                        title="Project"
                        options={projects}
                        onFilterChange={handleFilterChange}
                    />
                )}
                {table.getColumn("status") && (
                    <DataTableFacetedFilter column={table.getColumn("status")} title="Status" options={statuses} />
                )}
                {table.getColumn("priority") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("priority")}
                        title="Priority"
                        options={priorities}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            table.resetColumnFilters();
                            handleFilterChange([]);
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <XIcon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}
