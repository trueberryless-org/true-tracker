"use client";

import { Project, Task } from "@/models";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../tasks/data-table-column-header";
import { priorities, statuses } from "@/models/task";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { DataTableRowActions } from "../tasks/data-table-row-actions";
import { calculateTotalTime, msToTime } from "@/utils/taskUtils";
import { useEffect } from "react";
import { loadData } from "@/utils/load";

export const columnsXl: ColumnDef<Task>[] = [
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
        accessorKey: "projectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />,
        cell: ({ row }) => {
            const user = loadData();
            const projects = user?.projects || [];

            // Find the project that contains the current task
            const project = projects.find((project) => {
                return project.tasks.some((task: Task) => task.id === row.original.id);
            });

            return (
                <div className="flex space-x-2">
                    {/* Display project name if found */}
                    <span className="max-w-[500px] truncate font-medium">
                        {project ? project.name : "Project Not Found"}
                    </span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "timeSpent",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Time Running" />,
        cell: ({ row }) => {
            const task: Task = row.original; // Assuming row.original contains the Task object
            const totalTime = calculateTotalTime(task);
            const formattedTime = msToTime(totalTime);

            return <div className="font-medium">{formattedTime}</div>;
        },
    },
    // {
    //     accessorKey: "timeSpansCount",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Number of Time Spans" />
    //     ),
    //     cell: ({ row }) => {
    //         const task: Task = row.original;

    //         return (
    //             <div className="font-medium">
    //                 {task.timeSpans.length} Slot{task.timeSpans.length > 1 ? "s" : ""}
    //             </div>
    //         );
    //     },
    // },
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

export const columnsLg: ColumnDef<Task>[] = [
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
        accessorKey: "projectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />,
        cell: ({ row }) => {
            const user = loadData();
            const projects = user?.projects || [];

            // Find the project that contains the current task
            const project = projects.find((project) => {
                return project.tasks.some((task: Task) => task.id === row.original.id);
            });

            return (
                <div className="flex space-x-2">
                    {/* Display project name if found */}
                    <span className="max-w-[500px] truncate font-medium">
                        {project ? project.name : "Project Not Found"}
                    </span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "timeSpent",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Time Running" />,
        cell: ({ row }) => {
            const task: Task = row.original; // Assuming row.original contains the Task object
            const totalTime = calculateTotalTime(task);
            const formattedTime = msToTime(totalTime);

            return <div className="font-medium">{formattedTime}</div>;
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

export const columnsMd: ColumnDef<Task>[] = [
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
        accessorKey: "projectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />,
        cell: ({ row }) => {
            const user = loadData();
            const projects = user?.projects || [];

            // Find the project that contains the current task
            const project = projects.find((project) => {
                return project.tasks.some((task: Task) => task.id === row.original.id);
            });

            return (
                <div className="flex space-x-2">
                    {/* Display project name if found */}
                    <span className="max-w-[500px] truncate font-medium">
                        {project ? project.name : "Project Not Found"}
                    </span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
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

export const columnsSm: ColumnDef<Task>[] = [
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
        accessorKey: "projectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Project" />,
        cell: ({ row }) => {
            const user = loadData();
            const projects = user?.projects || [];

            // Find the project that contains the current task
            const project = projects.find((project) => {
                return project.tasks.some((task: Task) => task.id === row.original.id);
            });

            return (
                <div className="flex space-x-2">
                    {/* Display project name if found */}
                    <span className="max-w-[500px] truncate font-medium">
                        {project ? project.name : "Project Not Found"}
                    </span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
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
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end">
                <DataTableRowActions row={row} />
            </div>
        ),
    },
];

export const columnsMobile: ColumnDef<Task>[] = [
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
