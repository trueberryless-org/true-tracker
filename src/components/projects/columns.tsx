"use client";

import { Project } from "@/models";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { priorities, statuses } from "@/models/project";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { DataTableRowActions } from "./data-table-row-actions";

export const columnsXl: ColumnDef<Project>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("name")}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("description")}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => {
            const dateValue = row.getValue("createdAt");
            const dateString = String(dateValue);
            const parsedDate = Date.parse(dateString);
            let formattedDate = "";

            if (!isNaN(parsedDate)) {
                formattedDate = format(parsedDate, "MMMM dd, yyyy");
            } else {
                formattedDate = "-";
            }

            return <div className="font-medium">{formattedDate}</div>;
        },
    },
    {
        accessorKey: "lastUpdatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated At" />,
        cell: ({ row }) => {
            const dateValue = row.getValue("lastUpdatedAt");
            const dateString = String(dateValue);
            const parsedDate = Date.parse(dateString);
            let formattedDate = "";

            if (!isNaN(parsedDate)) {
                formattedDate = format(parsedDate, "MMMM dd, yyyy");
            } else {
                formattedDate = "-";
            }

            return <div className="font-medium">{formattedDate}</div>;
        },
    },
    {
        accessorKey: "archivedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Archived At" />,
        cell: ({ row }) => {
            const dateValue = row.getValue("archivedAt");
            const dateString = String(dateValue);
            const parsedDate = Date.parse(dateString);
            let formattedDate = "";

            if (!isNaN(parsedDate)) {
                formattedDate = format(parsedDate, "MMMM dd, yyyy");
            } else {
                formattedDate = "-";
            }

            return <div className="font-medium">{formattedDate}</div>;
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = statuses.find((status) => status.value === row.getValue("status"));

            if (!status) {
                return null;
            }

            return (
                <div className="flex w-[100px] items-center">
                    {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{status.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
        cell: ({ row }) => {
            const priority = priorities.find(
                (priority) => priority.value === row.getValue("priority")
            );

            if (!priority) {
                return null;
            }

            return (
                <div className="flex items-center">
                    {priority.icon && (
                        <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{priority.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end">
                <div className="flex justify-end">
                    <DataTableRowActions row={row} />
                </div>
            </div>
        ),
    },
];

export const columnsLg: ColumnDef<Project>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("name")}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("description")}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => {
            const dateValue = row.getValue("createdAt");
            const dateString = String(dateValue);
            const parsedDate = Date.parse(dateString);
            let formattedDate = "";

            if (!isNaN(parsedDate)) {
                formattedDate = format(parsedDate, "MMMM dd, yyyy");
            } else {
                formattedDate = "-";
            }

            return <div className="font-medium">{formattedDate}</div>;
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = statuses.find((status) => status.value === row.getValue("status"));

            if (!status) {
                return null;
            }

            return (
                <div className="flex w-[100px] items-center">
                    {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{status.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
        cell: ({ row }) => {
            const priority = priorities.find(
                (priority) => priority.value === row.getValue("priority")
            );

            if (!priority) {
                return null;
            }

            return (
                <div className="flex items-center">
                    {priority.icon && (
                        <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{priority.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end">
                <DataTableRowActions row={row} />
            </div>
        ),
    },
];

export const columnsMd: ColumnDef<Project>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("name")}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => {
            const dateValue = row.getValue("createdAt");
            const dateString = String(dateValue);
            const parsedDate = Date.parse(dateString);
            let formattedDate = "";

            if (!isNaN(parsedDate)) {
                formattedDate = format(parsedDate, "MMMM dd, yyyy");
            } else {
                formattedDate = "-";
            }

            return <div className="font-medium">{formattedDate}</div>;
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = statuses.find((status) => status.value === row.getValue("status"));

            if (!status) {
                return null;
            }

            return (
                <div className="flex w-[100px] items-center">
                    {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{status.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
        cell: ({ row }) => {
            const priority = priorities.find(
                (priority) => priority.value === row.getValue("priority")
            );

            if (!priority) {
                return null;
            }

            return (
                <div className="flex items-center">
                    {priority.icon && (
                        <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{priority.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end">
                <DataTableRowActions row={row} />
            </div>
        ),
    },
];

export const columnsSm: ColumnDef<Project>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("name")}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = statuses.find((status) => status.value === row.getValue("status"));

            if (!status) {
                return null;
            }

            return (
                <div className="flex w-[100px] items-center">
                    {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{status.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
        cell: ({ row }) => {
            const priority = priorities.find(
                (priority) => priority.value === row.getValue("priority")
            );

            if (!priority) {
                return null;
            }

            return (
                <div className="flex items-center">
                    {priority.icon && (
                        <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{priority.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end">
                <DataTableRowActions row={row} />
            </div>
        ),
    },
];

export const columnsMobile: ColumnDef<Project>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            // const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("name")}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = statuses.find((status) => status.value === row.getValue("status"));

            if (!status) {
                return null;
            }

            return (
                <div className="flex w-[100px] items-center">
                    {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{status.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
];
