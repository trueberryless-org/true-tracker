"use client";

import { User } from "@/models";
import { TrendingUp } from "lucide-react";
import { DateRange } from "react-day-picker";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import { getSessionDuration, isSessionInDateRange } from "@/utils/sessionUtils";
import { getTaskDuration, getTaskWithMostSessionDurationInInterval } from "@/utils/taskUtils";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
    { weekday: "Mon", task_1: 186, task_2: 80 },
    { weekday: "Tue", task_1: 305, task_2: 200 },
    { weekday: "Wed", task_1: 237, task_2: 120 },
    { weekday: "Thu", task_1: 73, task_2: 190 },
    { weekday: "Fri", task_1: 186, task_2: 50 },
    { weekday: "Sat", task_1: 305, task_2: 130 },
    { weekday: "Sun", task_1: 237, task_2: 200 },
];

const chartConfig = {
    task_1: {
        label: "Task 1",
        color: "hsl(var(--chart-1))",
    },
    task_2: {
        label: "Task 2",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

const getLastSevenWeekdays = () => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const lastSevenDays = [];
    const day = new Date(today);
    day.setDate(today.getDate());
    lastSevenDays.push(weekdays[day.getDay()]);
    for (let i = 6; i >= 1; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        lastSevenDays.push(weekdays[day.getDay()]);
    }
    return lastSevenDays;
};

function generateChartData(user: User): { chartData: any; chartConfig: any } {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    // Set time for from and to dates
    sevenDaysAgo.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);

    const dateRange: DateRange = { from: sevenDaysAgo, to: today };
    const task1 = getTaskWithMostSessionDurationInInterval(user, dateRange);
    const task2 = getTaskWithMostSessionDurationInInterval(user, dateRange, task1 ? [task1.id] : []);

    if (!task1) {
        return { chartData: [], chartConfig: {} };
    }

    const weekdays = getLastSevenWeekdays();

    const chartData = weekdays.map((weekday) => {
        const date = new Date();
        date.setDate(date.getDate() - weekdays.indexOf(weekday));
        const task1Duration = task1.sessions
            .filter((session) =>
                isSessionInDateRange(session, {
                    from: new Date(date.setHours(0, 0, 0, 0)),
                    to: new Date(date.setHours(23, 59, 59, 999)),
                }),
            )
            .reduce((sum, session) => sum + getSessionDuration(session), 0);

        if (!task2) {
            return {
                weekday,
                task_1: task1Duration,
            };
        }

        const task2Duration = task2
            ? task2.sessions
                  .filter((session) =>
                      isSessionInDateRange(session, {
                          from: new Date(date.setHours(0, 0, 0, 0)),
                          to: new Date(date.setHours(23, 59, 59, 999)),
                      }),
                  )
                  .reduce((sum, session) => sum + getSessionDuration(session), 0)
            : 0;

        return {
            weekday,
            task_1: task1Duration,
            task_2: task2Duration,
        };
    });

    var chartConfig: any = {
        task_1: {
            label: task1.name,
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    if (task2) {
        chartConfig.task_2 = {
            label: task2.name,
            color: "hsl(var(--chart-2))",
        };
    }

    return { chartData, chartConfig };
}

interface ChartTaskDurationRadarProps {
    user: User;
    className?: string;
}

export function ChartTaskDurationRadar({ user, className }: ChartTaskDurationRadarProps) {
    const { chartData, chartConfig } = generateChartData(user);

    if (chartData.length === 0) {
        return (
            <Card className={className}>
                <CardHeader className="items-center pb-4">
                    <CardTitle>No data available</CardTitle>
                    <CardDescription>No data available for the selected time period.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="items-center pb-4">
                <CardTitle>Task duration in the last week</CardTitle>
                <CardDescription>Showing total time spent on the most worked on tasks.</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
                    <RadarChart data={chartData} outerRadius={"69%"}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <PolarAngleAxis dataKey="weekday" />
                        <PolarGrid radialLines={false} />
                        <Radar dataKey="task_1" fill="var(--color-task_1)" fillOpacity={0.6} />
                        <Radar dataKey="task_2" fill="var(--color-task_2)" />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-task_2 leading-none">
                    Trending up by 5.2% this weekday <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>
            </CardFooter>
        </Card>
    );
}
