"use client";

import { Session } from "@/models";
import {
    addDays,
    addMonths,
    addWeeks,
    differenceInDays,
    eachDayOfInterval,
    eachMonthOfInterval,
    eachWeekOfInterval,
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    getWeek,
    isValid,
    startOfDay,
    startOfMonth,
    startOfWeek,
} from "date-fns";
import { Fish, PawPrint, Rabbit, Snail } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface FlowData {
    date: string;
    smooth: number;
    good: number;
    neutral: number;
    disrupted: number;
}

const chartConfig: ChartConfig = {
    smooth: {
        label: "Smooth",
        color: "hsl(var(--chart-1))",
        icon: Rabbit,
    },
    good: {
        label: "Good",
        color: "hsl(var(--chart-2))",
        icon: PawPrint,
    },
    neutral: {
        label: "Neutral",
        color: "hsl(var(--chart-3))",
        icon: Fish,
    },
    disrupted: {
        label: "Disrupted",
        color: "hsl(var(--chart-4))",
        icon: Snail,
    },
};

function getIntervalKey(dateRange: DateRange): "month" | "week" | "day" {
    const diffDays = differenceInDays(new Date(dateRange.to!), new Date(dateRange.from!));
    if (diffDays > 270) {
        // ~9 months
        return "month";
    } else if (diffDays > 14) {
        // ~2 weeks
        return "week";
    } else {
        return "day";
    }
}

function getAllIntervals(start: Date, end: Date, interval: "month" | "week" | "day"): string[] {
    let intervals: string[] = [];
    switch (interval) {
        case "month":
            intervals = eachMonthOfInterval({ start, end }).map((date) => format(date, "yyyy-MM"));
            break;
        case "week":
            intervals = eachWeekOfInterval({ start, end }).map((date) => {
                const weekStart = startOfWeek(date, { weekStartsOn: 1 });
                return `${weekStart.getFullYear()}-W${getWeek(weekStart, { weekStartsOn: 1 })}`;
            });
            break;
        case "day":
            intervals = eachDayOfInterval({ start, end }).map((date) => format(date, "yyyy-MM-dd"));
            break;
    }
    return intervals;
}

function aggregateFlowData(sessions: Session[], dateRange: DateRange, interval: "month" | "week" | "day"): FlowData[] {
    const allIntervals = getAllIntervals(new Date(dateRange.from!), new Date(dateRange.to!), interval);
    const data: any = {};

    allIntervals.forEach((intervalKey) => {
        data[intervalKey] = {
            date: intervalKey,
            smooth: 0,
            good: 0,
            neutral: 0,
            disrupted: 0,
        };
    });

    sessions.forEach((session) => {
        const startDate = new Date(session.start);
        const endDate = session.end ? new Date(session.end) : new Date();

        if (endDate < new Date(dateRange.from!) || startDate > new Date(dateRange.to!)) {
            return; // Skip sessions outside the date range
        }

        let currentDate = startDate;
        while (currentDate <= endDate) {
            const intervalKey = getAllIntervals(currentDate, currentDate, interval)[0];
            if (data[intervalKey]) {
                const duration = endDate.getTime() - startDate.getTime();
                data[intervalKey][session.flow] += Math.floor(duration / 1000);
            }

            // Move to the next interval
            switch (interval) {
                case "month":
                    currentDate = addMonths(currentDate, 1);
                    currentDate = startOfMonth(currentDate);
                    break;
                case "week":
                    currentDate = addWeeks(currentDate, 1);
                    currentDate = startOfWeek(currentDate, { weekStartsOn: 1 });
                    break;
                case "day":
                default:
                    currentDate = addDays(currentDate, 1);
                    break;
            }
        }
    });

    return allIntervals.map(
        (intervalKey) =>
            data[intervalKey] || {
                date: intervalKey,
                smooth: 0,
                good: 0,
                neutral: 0,
                disrupted: 0,
            },
    );
}

function formatDuration(seconds: number, interval: "month" | "week" | "day"): string {
    switch (interval) {
        case "month":
        case "week":
            return `${(seconds / 3600).toFixed(2)} h`; // hours
        case "day":
            if (seconds >= 3600) {
                return `${(seconds / 3600).toFixed(2)} h`; // hours
            } else if (seconds >= 60) {
                return `${(seconds / 60).toFixed(2)} min`; // minutes
            } else {
                return `${seconds.toFixed(2)} s`; // seconds
            }
    }
}

export function SessionsChart({ sessions, dateRange }: { sessions: Session[]; dateRange: DateRange }) {
    const interval = getIntervalKey(dateRange);
    const flowData = aggregateFlowData(sessions, dateRange, interval);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Session Flow Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart data={flowData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => {
                                if (!isValid(new Date(value))) {
                                    return value; // if value is not a valid date, return it as is
                                }
                                const date = new Date(value);
                                if (interval === "month") {
                                    return format(date, "yyyy-MM");
                                } else if (interval === "week") {
                                    const weekStart = startOfWeek(date, {
                                        weekStartsOn: 1,
                                    });
                                    return `${weekStart.getFullYear()}-W${getWeek(weekStart, {
                                        weekStartsOn: 1,
                                    })}`;
                                } else {
                                    return format(date, "yyyy-MM-dd");
                                }
                            }}
                        />
                        <YAxis
                            tickFormatter={(value) => formatDuration(value, interval)}
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                        <Bar dataKey="smooth" stackId="a" fill={chartConfig.smooth.color} />
                        <Bar dataKey="good" stackId="a" fill={chartConfig.good.color} />
                        <Bar dataKey="neutral" stackId="a" fill={chartConfig.neutral.color} />
                        <Bar dataKey="disrupted" stackId="a" fill={chartConfig.disrupted.color} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
