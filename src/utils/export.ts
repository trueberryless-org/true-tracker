import { Project, User } from "@/models";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { loadData } from "./load";

export const exportData = () => {
  const data = loadData();
  if (data) {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "timeTrackerData.json";
      document.body.appendChild(a); // Append anchor to body
      a.click();
      document.body.removeChild(a); // Clean up: remove anchor from body
      URL.revokeObjectURL(url); // Clean up: revoke the URL object
      toast("Data exported successfully.");
    } catch (error) {
      console.error("Error exporting data", error);
      toast("Error exporting data. Please try again.");
    }
  } else {
    console.error("No data to export");
    toast("No data available to export.");
  }
};

const convertToCSV = (data: User, dateRange: DateRange) => {
  const headers = [
    "Project ID",
    "Project Name",
    "Project Description",
    "Task ID",
    "Task Name",
    "Task Description",
    "Task Priority",
    "Task Status",
    "Session ID",
    "Session Description",
    "Session Flow",
    "Session Start",
    "Session End",
    "Session Duration (minutes)",
    "Session Duration (seconds)",
    "Session Duration (hours)",
    "Session Duration (HH:mm:ss)",
  ];

  const rows: (string | Date)[][] = [];

  const isWithinDateRange = (
    date: string | number | Date,
    dateRange: DateRange
  ) => {
    const from = dateRange.from
      ? new Date(dateRange.from).getTime()
      : -Infinity;
    const to = dateRange.to
      ? new Date(dateRange.to).setHours(23, 59, 59, 999)
      : Infinity;
    const sessionDate = new Date(date).getTime();
    return sessionDate >= from && sessionDate <= to;
  };

  const formatDuration = (
    start: string | number | Date,
    end: string | number | Date | null
  ) => {
    if (!end) return ["", "", "", ""];

    const durationInMs = new Date(end).getTime() - new Date(start).getTime();
    const durationInSeconds = durationInMs / 1000;
    const durationInMinutes = durationInSeconds / 60;
    const durationInHours = durationInMinutes / 60;

    const hours = Math.floor(durationInHours);
    const minutes = Math.floor(durationInMinutes % 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const hhmmss = [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");

    return [
      durationInMinutes.toFixed(2),
      durationInSeconds.toFixed(2),
      durationInHours.toFixed(2),
      hhmmss,
    ];
  };

  data.projects.forEach((project) => {
    project.tasks.forEach((task) => {
      task.sessions.forEach((session) => {
        if (isWithinDateRange(session.start, dateRange)) {
          const [
            durationMinutes,
            durationSeconds,
            durationHours,
            durationHHMMSS,
          ] = formatDuration(session.start, session.end);

          rows.push([
            project.id,
            project.name,
            project.description || "",
            task.id,
            task.name,
            task.description || "",
            task.priority,
            task.status || "",
            session.id,
            session.description || "",
            session.flow,
            session.start,
            session.end || "",
            durationMinutes,
            durationSeconds,
            durationHours,
            durationHHMMSS,
          ]);
        }
      });
    });
  });

  const csvContent = [
    headers.join(","), // CSV-Header
    ...rows.map((row) => row.join(",")), // CSV-Inhalt
  ].join("\n");

  return csvContent;
};

const getFormattedDateRange = (dateRange: DateRange) => {
  const from = dateRange.from ? new Date(dateRange.from) : new Date();
  const to = dateRange.to ? new Date(dateRange.to) : new Date();
  const fromStr = `${from.getFullYear()}-${(from.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${from.getDate().toString().padStart(2, "0")}`;
  const toStr = `${to.getFullYear()}-${(to.getMonth() + 1).toString().padStart(2, "0")}-${to
    .getDate()
    .toString()
    .padStart(2, "0")}`;
  return `${fromStr}_to_${toStr}`;
};

export const downloadData = (dateRange: DateRange) => {
  const data = loadData();
  if (data) {
    try {
      const csvData = convertToCSV(data, dateRange);
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeTrackerData_${getFormattedDateRange(dateRange)}.csv`;
      document.body.appendChild(a); // Append anchor to body
      a.click();
      document.body.removeChild(a); // Clean up: remove anchor from body
      URL.revokeObjectURL(url); // Clean up: revoke the URL object
      toast("Data exported successfully.");
    } catch (error) {
      console.error("Error exporting data", error);
      toast("Error exporting data. Please try again.");
    }
  } else {
    console.error("No data to export");
    toast("No data available to export.");
  }
};
