"use client";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useUser } from "../UserContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableViewOptions } from "./data-table-view-options";

interface TEntity {
    id: string;
}

interface DataTableProps<TData extends TEntity, TValue> {
    title: string;
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: boolean;
    clickableRows?: boolean;
    filtering?: boolean;
}

export function DataTable<TData extends TEntity, TValue>({
    title,
    columns,
    data,
    pagination,
    clickableRows,
    filtering,
}: DataTableProps<TData, TValue>) {
    const router = useRouter();
    const { user } = useUser();

    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    function handleRowClick(id: string): void {
        if (clickableRows) {
            router.push(`/sessions/${id}`);
        }
    }

    const [newQueryParams, setNewQueryParams] = React.useState("");
    const task = user?.projects.flatMap((project) => project.tasks).find((task) => task.id === router.query.taskId);

    React.useEffect(() => {
        if (task && user?.projects.some((project) => project.tasks.map((task) => task.name).includes(task.name))) {
            table.getColumn("taskName")?.setFilterValue([task.name]);
            setNewQueryParams(`?taskId=${task.id}`);
        }
    }, [table, router.query.projectId, user?.projects, task]);

    const [onlyArchivedTasks, setOnlyArchivedTasks] = React.useState(false);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    {title}
                    {!filtering && <DataTableViewOptions table={table} />}
                    {filtering && !onlyArchivedTasks && (
                        <Button asChild size="sm" className="gap-1">
                            <Link href={`/sessions/new${newQueryParams}`}>
                                Create New Session
                                <Plus className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {filtering && (
                        <DataTableToolbar
                            table={table}
                            setNewQueryParams={setNewQueryParams}
                            setOnlyArchivedTasks={setOnlyArchivedTasks}
                        />
                    )}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} colSpan={header.colSpan}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext(),
                                                          )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            onClick={() => handleRowClick(row.original.id)}
                                            className={clickableRows ? "cursor-pointer" : ""}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="truncate">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {pagination && <DataTablePagination table={table} />}
                </div>
            </CardContent>
        </Card>
    );
}
