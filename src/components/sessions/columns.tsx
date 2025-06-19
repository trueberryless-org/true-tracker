"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { priorities, statuses } from "@/models/project";
import { ExtendedSession, flows } from "@/models/session";

import { msToTime } from "@/utils/dateUtils";

import { Badge } from "../ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columnsXl: ColumnDef<ExtendedSession>[] = [
  {
    accessorKey: "projectName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("projectName")}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "taskName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("taskName")}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("description")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "flow",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flow" />
    ),
    cell: ({ row }) => {
      const flow = flows.find((flow) => flow.value === row.getValue("flow"));

      if (!flow) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {row.original.projectIsArchived === true && (
            <Badge variant="destructive">Archived</Badge>
          )}
          {flow.icon && (
            <flow.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{flow.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "start",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Time" />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("start");
      const dateString = String(dateValue);
      const parsedDate = Date.parse(dateString);
      let formattedDate = "";

      if (!isNaN(parsedDate)) {
        formattedDate = format(parsedDate, "hh:mm:ss");
      } else {
        formattedDate = "-";
      }

      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "end",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Time" />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("end");
      if (dateValue === null) {
        return <div className="font-medium">Still running</div>;
      }
      const dateString = String(dateValue);
      const parsedDate = Date.parse(dateString);
      let formattedDate = "";

      if (!isNaN(parsedDate)) {
        formattedDate = format(parsedDate, "hh:mm:ss");
      } else {
        formattedDate = "-";
      }

      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const start: string = row.getValue("start");
      const end: string = row.getValue("end") || new Date().toString();
      const duration = new Date(end).getTime() - new Date(start).getTime();

      return <div className="font-medium">{msToTime(duration)}</div>;
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

export const columnsLg: ColumnDef<ExtendedSession>[] = [
  {
    accessorKey: "projectName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("projectName")}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "taskName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("taskName")}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "flow",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flow" />
    ),
    cell: ({ row }) => {
      const flow = flows.find((flow) => flow.value === row.getValue("flow"));

      if (!flow) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {row.original.projectIsArchived === true && (
            <Badge variant="destructive">Archived</Badge>
          )}
          {flow.icon && (
            <flow.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{flow.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "start",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Time" />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("start");
      const dateString = String(dateValue);
      const parsedDate = Date.parse(dateString);
      let formattedDate = "";

      if (!isNaN(parsedDate)) {
        formattedDate = format(parsedDate, "hh:mm:ss");
      } else {
        formattedDate = "-";
      }

      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "end",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Time" />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("end");
      if (dateValue === null) {
        return <div className="font-medium">Still running</div>;
      }
      const dateString = String(dateValue);
      const parsedDate = Date.parse(dateString);
      let formattedDate = "";

      if (!isNaN(parsedDate)) {
        formattedDate = format(parsedDate, "hh:mm:ss");
      } else {
        formattedDate = "-";
      }

      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const start: string = row.getValue("start");
      const end: string = row.getValue("end") || new Date().toString();
      const duration = new Date(end).getTime() - new Date(start).getTime();

      return <div className="font-medium">{msToTime(duration)}</div>;
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

export const columnsMd: ColumnDef<ExtendedSession>[] = [
  {
    accessorKey: "taskName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("taskName")}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "flow",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flow" />
    ),
    cell: ({ row }) => {
      const flow = flows.find((flow) => flow.value === row.getValue("flow"));

      if (!flow) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {row.original.projectIsArchived === true && (
            <Badge variant="destructive">Archived</Badge>
          )}
          {flow.icon && (
            <flow.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{flow.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "start",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Time" />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("start");
      const dateString = String(dateValue);
      const parsedDate = Date.parse(dateString);
      let formattedDate = "";

      if (!isNaN(parsedDate)) {
        formattedDate = format(parsedDate, "hh:mm:ss");
      } else {
        formattedDate = "-";
      }

      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "end",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Time" />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("end");
      if (dateValue === null) {
        return <div className="font-medium">Still running</div>;
      }
      const dateString = String(dateValue);
      const parsedDate = Date.parse(dateString);
      let formattedDate = "";

      if (!isNaN(parsedDate)) {
        formattedDate = format(parsedDate, "hh:mm:ss");
      } else {
        formattedDate = "-";
      }

      return <div className="font-medium">{formattedDate}</div>;
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

export const columnsSm: ColumnDef<ExtendedSession>[] = [
  {
    accessorKey: "taskName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("taskName")}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "flow",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flow" />
    ),
    cell: ({ row }) => {
      const flow = flows.find((flow) => flow.value === row.getValue("flow"));

      if (!flow) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {row.original.projectIsArchived === true && (
            <Badge variant="destructive">Archived</Badge>
          )}
          {flow.icon && (
            <flow.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{flow.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "start",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Time" />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("start");
      const dateString = String(dateValue);
      const parsedDate = Date.parse(dateString);
      let formattedDate = "";

      if (!isNaN(parsedDate)) {
        formattedDate = format(parsedDate, "hh:mm:ss");
      } else {
        formattedDate = "-";
      }

      return <div className="font-medium">{formattedDate}</div>;
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

export const columnsMobile: ColumnDef<ExtendedSession>[] = [
  {
    accessorKey: "start",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Time" />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("start");
      const dateString = String(dateValue);
      const parsedDate = Date.parse(dateString);
      let formattedDate = "";

      if (!isNaN(parsedDate)) {
        formattedDate = format(parsedDate, "hh:mm:ss");
      } else {
        formattedDate = "-";
      }

      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "flow",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flow" />
    ),
    cell: ({ row }) => {
      const flow = flows.find((flow) => flow.value === row.getValue("flow"));

      if (!flow) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {row.original.projectIsArchived === true && (
            <Badge variant="destructive">Archived</Badge>
          )}
          {flow.icon && (
            <flow.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{flow.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
