"use client";

import { User } from "@/models";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { Label, Pie, PieChart } from "recharts";

import { isSessionInDateRange } from "@/utils/sessionUtils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const getChartConfig = (projectNames: string[]) => {
  const config: ChartConfig = {
    tasks: {
      label: "Tasks",
    },
  };

  projectNames.forEach((name, index) => {
    config[name] = {
      label: name,
      color: `hsl(var(--chart-${index + 1}))`,
    };
  });

  config.other = {
    label: "Other",
    color: "hsl(var(--chart-5))",
  };

  return config;
};

const calculateChartData = (user: User, dateRange: DateRange | undefined) => {
  const projects = user.projects;
  var projectTaskCounts = projects.map((project) => ({
    name: project.name,
    taskCount: project.tasks.length,
  }));

  if (dateRange) {
    projectTaskCounts = projects.map((project) => ({
      name: project.name,
      taskCount: project.tasks.filter((task) =>
        task.sessions.some((session) =>
          isSessionInDateRange(session, dateRange)
        )
      ).length,
    }));
  }

  projectTaskCounts.sort((a, b) => b.taskCount - a.taskCount);

  const topProjects = projectTaskCounts.slice(0, 4);
  const otherProjects = projectTaskCounts.slice(4);

  const otherTaskCount = otherProjects.reduce(
    (acc, project) => acc + project.taskCount,
    0
  );

  const chartData = [
    ...topProjects.map((project, index) => ({
      project: project.name,
      tasks: project.taskCount,
      fill: `hsl(var(--chart-${index + 1}))`,
    })),
    {
      project: "Other",
      tasks: otherTaskCount,
      fill: "hsl(var(--chart-5))",
    },
  ];

  return chartData;
};

function rangeText(dateRange: DateRange | undefined): React.ReactNode {
  if (dateRange == undefined) return "All time";
  if (
    dateRange.from?.getFullYear() != new Date().getFullYear() &&
    dateRange.to == undefined
  )
    return format(new Date(dateRange.from!), "d MMMM yyyy");
  if (dateRange.to == undefined)
    return format(new Date(dateRange.from!), "MMMM d");
  if (dateRange.from?.getFullYear() != new Date().getFullYear())
    return `${format(new Date(dateRange.from!), "d MMMM yyyy")} - ${format(new Date(dateRange.to!), "d MMMM yyyy")}`;
  return `${format(new Date(dateRange.from!), "MMMM d")} - ${format(new Date(dateRange.to!), "MMMM d")}`;
}

function getHelperText(
  chartData: { project: string; tasks: number; fill: string }[],
  totalTasks: number
): React.ReactNode {
  if (chartData.filter((data) => data.tasks !== 0).length >= 2) {
    return `${chartData[0].project} has ${(chartData[0].tasks / chartData[1].tasks) * 100 - 100}% more tasks`;
  }
  if (chartData.filter((data) => data.tasks !== 0).length === 1) {
    return `${chartData[0].project} has ${chartData[0].tasks} task${chartData[0].tasks == 1 ? "" : "s"}`;
  }
  return "Nothing to show";
}

interface ChartTaskAmountProps {
  user: User;
  dateRange?: DateRange;
  className?: string;
}

export function ChartTaskAmount({
  user,
  dateRange,
  className,
}: ChartTaskAmountProps) {
  const chartData = calculateChartData(user, dateRange);

  const totalTasks = chartData.reduce((acc, curr) => acc + curr.tasks, 0);

  const chartConfig = getChartConfig(chartData.map((data) => data.project));

  return (
    <Card className={`${className} flex flex-col`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Active Tasks per project</CardTitle>
        <CardDescription>{rangeText(dateRange)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[400px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="tasks"
              nameKey="project"
              innerRadius={"60%"}
              startAngle={90}
              endAngle={-270}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalTasks.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Tasks
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {getHelperText(chartData, totalTasks)}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing top {chartData.filter((data) => data.tasks !== 0).length}{" "}
          project
          {chartData.filter((data) => data.tasks !== 0).length == 1 ? "" : "s"}
        </div>
      </CardFooter>
    </Card>
  );
}
