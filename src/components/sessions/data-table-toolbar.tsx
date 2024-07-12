"use client";

import { XIcon } from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { flows } from "@/models/session";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { useUser } from "../UserContext";
import { Project } from "@/models";
import { DataTableFacetedFilterSimple } from "./data-table-faceted-filter-simple";

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

    let projects: string[] =
        user && user.projects
            ? [...new Set(user.projects.map((project: Project) => project.name))]
            : [];

    let tasks: string[] =
        user && user.projects
            ? [
                  ...new Set(
                      user.projects
                          .map((project: Project) => project.tasks.map((task) => task.name))
                          .flat()
                  ),
              ]
            : [];

    const handleFilterChange = (filterValues: string[]) => {
        const taskNameColumn = table.getColumn("taskName");
        if (taskNameColumn && filterValues.length === 1) {
            const task = user?.projects
                .flatMap((project) => project.tasks)
                .find((task) => task.name === filterValues[0]);
            if (task) {
                setNewQueryParams(`?taskId=${task.id}`);
                if (
                    user?.projects.find((project) => project.tasks.some((t) => t.id === task.id))
                        ?.archivedAt
                ) {
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

    const handleFilterChangeProject = (filterValues: string[]) => {
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
                    placeholder="Filter sessions..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("projectName") && (
                    <DataTableFacetedFilterSimple
                        column={table.getColumn("projectName")}
                        title="Project"
                        options={projects}
                        onFilterChange={handleFilterChangeProject}
                    />
                )}
                {table.getColumn("taskName") && (
                    <DataTableFacetedFilterSimple
                        column={table.getColumn("taskName")}
                        title="Task"
                        options={tasks}
                        onFilterChange={handleFilterChange}
                    />
                )}
                {table.getColumn("flow") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("flow")}
                        title="Flow"
                        options={flows}
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
