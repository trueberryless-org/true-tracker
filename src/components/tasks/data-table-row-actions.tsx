"use client";

import { EllipsisIcon, Edit2Icon } from "lucide-react";
import { Row } from "@tanstack/react-table";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project, Task } from "@/models";

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps<Task>) {
    const taskId = row.original.id;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                    <EllipsisIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                <Link href={`/tasks/${taskId}`}>
                    <DropdownMenuItem>View</DropdownMenuItem>
                </Link>
                <Link href={`/tasks/${taskId}/edit`}>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
