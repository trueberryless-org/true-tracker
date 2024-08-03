"use client";

import { User } from "@/models";
import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
    { month: "Smooth", high: 186, medium: 80, low: 50 },
    { month: "Good", high: 305, medium: 200, low: 130 },
    { month: "Neutral", high: 237, medium: 120, low: 20 },
    { month: "Disrupted", high: 73, medium: 190, low: 150 },
];

const chartConfig = {
    high: {
        label: "High",
        color: "hsl(var(--chart-1))",
    },
    medium: {
        label: "Medium",
        color: "hsl(var(--chart-2))",
    },
    low: {
        label: "Low",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;

interface ChartSessionFlowProps {
    user: User;
    className?: string;
}

export function ChartSessionFlow({ user, className }: ChartSessionFlowProps) {
    return (
        <Card className={className}>
            <CardHeader className="items-center pb-4">
                <CardTitle>Session flow per priority</CardTitle>
                <CardDescription>Showing total visitors for the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
                    <RadarChart data={chartData}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <PolarAngleAxis dataKey="month" />
                        <PolarGrid radialLines={false} gridType="circle" />
                        <Radar
                            dataKey="high"
                            fill="var(--color-high)"
                            fillOpacity={0.6}
                            // stroke="var(--color-high)"
                            // strokeWidth={5}
                        />
                        <Radar
                            dataKey="medium"
                            fill="var(--color-medium)"
                            fillOpacity={0.8}
                            // stroke="var(--color-medium)"
                            // strokeWidth={5}
                        />
                        <Radar
                            dataKey="low"
                            fill="var(--color-low)"
                            fillOpacity={1}
                            // stroke="var(--color-low)"
                            // strokeWidth={5}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>
            </CardFooter>
        </Card>
    );
}
