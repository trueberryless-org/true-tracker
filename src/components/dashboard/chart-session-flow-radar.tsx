"use client";

import { Session, User } from "@/models";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { DateRange } from "react-day-picker";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import { flows } from "@/models/session";
import { priorities } from "@/models/task";

import { isSessionInDateRange } from "@/utils/sessionUtils";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = priorities.reduce(
    (config, priority) => {
        config[priority.value] = {
            label: priority.label,
            color: `hsl(var(--chart-${priorities.indexOf(priority) + 1}))`,
        };
        return config;
    },
    {} as Record<string, { label: string; color: string }>,
);

const calculateChartData = (user: User, dateRange: DateRange | undefined) => {
    const sessions = user.projects.flatMap((project) =>
        project.tasks.flatMap((task) =>
            task.sessions.map((session) => ({
                ...session,
                priority: task.priority,
            })),
        ),
    );

    const filteredSessions = dateRange
        ? sessions.filter((session) => isSessionInDateRange(session, dateRange))
        : sessions;

    const chartData = flows.map((flow) => {
        const flowSessions = filteredSessions.filter((session) => session.flow === flow.value);
        const priorityCounts = priorities.reduce(
            (counts, priority) => {
                counts[priority.value] = flowSessions.filter((session) => session.priority === priority.value).length;
                return counts;
            },
            {} as Record<string, number>,
        );

        return { flow: flow.label, ...priorityCounts };
    });

    return chartData;
};

function rangeText(dateRange: DateRange | undefined): React.ReactNode {
    if (dateRange == undefined) return "All time";
    if (dateRange.from?.getFullYear() != new Date().getFullYear() && dateRange.to == undefined)
        return format(new Date(dateRange.from!), "d MMMM yyyy");
    if (dateRange.to == undefined) return format(new Date(dateRange.from!), "MMMM d");
    if (dateRange.from?.getFullYear() != new Date().getFullYear())
        return `${format(new Date(dateRange.from!), "d MMMM yyyy")} - ${format(new Date(dateRange.to!), "d MMMM yyyy")}`;
    return `${format(new Date(dateRange.from!), "MMMM d")} - ${format(new Date(dateRange.to!), "MMMM d")}`;
}

function getHelperText(chartData: { flow: string }[] | { [x: string]: any; flow: any }[]): React.ReactNode {
    const totalSessions = chartData.reduce(
        (sum, data) =>
            sum +
            Object.values(data)
                .slice(1)
                .reduce((total, count) => total + count, 0),
        0,
    );

    if (totalSessions === 0) {
        return "Keine Sitzungen in diesem Zeitraum.";
    }

    const flowData = chartData.map(({ flow, ...priorities }) => {
        const totalByFlow = Object.values(priorities).reduce((total, count) => total + count, 0);
        return {
            flow,
            totalByFlow,
            percentage: ((totalByFlow / totalSessions) * 100).toFixed(2),
        };
    });

    const highestFlow = flowData.reduce(
        (max, current) => (current.totalByFlow > max.totalByFlow ? current : max),
        flowData[0],
    );

    return `Von ${totalSessions} Sitzungen sind ${highestFlow.percentage}% in "${highestFlow.flow}"`;
}

interface ChartSessionFlowRadarProps {
    user: User;
    dateRange?: DateRange;
    className?: string;
}

export function ChartSessionFlowRadar({ user, dateRange, className }: ChartSessionFlowRadarProps) {
    const chartData = calculateChartData(user, dateRange);

    return (
        <Card className={className}>
            <CardHeader className="items-center pb-4">
                <CardTitle>Session flow per priority</CardTitle>
                <CardDescription>{rangeText(dateRange)}</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
                    <RadarChart data={chartData} outerRadius={"69%"}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <PolarAngleAxis dataKey="flow" />
                        <PolarGrid radialLines={true} gridType="circle" />
                        {priorities.map((priority) => (
                            <Radar
                                key={priority.value}
                                dataKey={priority.value}
                                fill={chartConfig[priority.value]?.color}
                                fillOpacity={0.6}
                            />
                        ))}
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">{getHelperText(chartData)}</div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Showing session grouped by priority of their tasks
                </div>
            </CardFooter>
        </Card>
    );
}
