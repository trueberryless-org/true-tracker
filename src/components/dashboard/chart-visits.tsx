"use client";

import { User } from "@/models";
import { TrendingDown, TrendingUp } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const chartConfig = {
  visits: {
    label: "Visits",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function generateChartDataYear(
  user: User
): [{ column: string; visits: number }[], number, number] {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i).reverse();

  // Initialize an object to store the count of visits for each year
  const yearlyVisits: Record<number, number> = {};
  years.forEach((year) => (yearlyVisits[year] = 0));

  // Track the years with visits
  const yearsWithVisits: Set<number> = new Set();

  // Iterate over each visit and increment the corresponding year count
  user.visits.forEach((visit) => {
    const visitYear = new Date(visit.time).getFullYear();
    if (yearlyVisits.hasOwnProperty(visitYear)) {
      yearlyVisits[visitYear]++;
      yearsWithVisits.add(visitYear);
    }
  });

  // Convert the yearly visits object to an array of objects for chart data
  const chartData = years.map((year) => ({
    column: year.toString(),
    visits: yearlyVisits[year],
  }));

  // Calculate the total number of visits and the average visits per year
  const totalVisits = Object.values(yearlyVisits).reduce(
    (sum, count) => sum + count,
    0
  );
  const currentYearVisits = yearlyVisits[currentYear];

  // Calculate the average visits per year based on years with visits
  const numberOfYearsWithVisits = yearsWithVisits.size;
  const averageVisitsPerYear =
    numberOfYearsWithVisits > 0 ? totalVisits / numberOfYearsWithVisits : 0;

  return [chartData, currentYearVisits, averageVisitsPerYear];
}

function generateChartDataMonth(
  user: User
): [{ column: string; visits: number }[], number, number] {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Initialize an object to store the count of visits for each month
  const monthlyVisits: Record<string, number> = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  // Track the months with visits
  const monthsWithVisits: Set<string> = new Set();

  // Iterate over each visit and increment the corresponding month count
  user.visits.forEach((visit) => {
    const monthIndex = new Date(visit.time).getMonth(); // Get month index (0-11)
    const monthName = monthNames[monthIndex]; // Get month name from index
    monthlyVisits[monthName]++;
    monthsWithVisits.add(monthName);
  });

  // Convert the monthly visits object to an array of objects for chart data
  const chartData = Object.keys(monthlyVisits).map((month) => ({
    column: month,
    visits: monthlyVisits[month],
  }));

  // Get the current month index
  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = monthNames[currentMonthIndex];

  // Calculate the total number of visits and the current month visit count
  const totalVisits = Object.values(monthlyVisits).reduce(
    (sum, count) => sum + count,
    0
  );
  const currentMonthVisits = monthlyVisits[currentMonthName];

  // Calculate the average visits per month based on months with visits
  const numberOfMonthsWithVisits = monthsWithVisits.size;
  const averageVisitsPerMonth =
    numberOfMonthsWithVisits > 0 ? totalVisits / numberOfMonthsWithVisits : 0;

  return [chartData, currentMonthVisits, averageVisitsPerMonth];
}

function generateChartDataWeek(
  user: User
): [{ column: string; visits: number }[], number, number] {
  const weekNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Initialize an object to store the count of visits for each week
  const weeklyVisits: Record<string, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  // Track the weeks with visits
  const weeksWithVisits: Set<string> = new Set();

  // Iterate over each visit and increment the corresponding week count
  user.visits.forEach((visit) => {
    const weekIndex = new Date(visit.time).getDay(); // Get week index (0-6)
    const weekName = weekNames[weekIndex]; // Get week name from index
    weeklyVisits[weekName]++;
    weeksWithVisits.add(weekName);
  });

  // Convert the weekly visits object to an array of objects for chart data
  const chartData = Object.keys(weeklyVisits).map((week) => ({
    column: week,
    visits: weeklyVisits[week],
  }));

  // Get the current week index
  const currentWeekIndex = new Date().getDay();
  const currentWeekName = weekNames[currentWeekIndex];

  // Calculate the total number of visits and the current week visit count
  const totalVisits = Object.values(weeklyVisits).reduce(
    (sum, count) => sum + count,
    0
  );
  const currentWeekVisits = weeklyVisits[currentWeekName];

  // Calculate the average visits per week based on weeks with visits
  const numberOfWeeksWithVisits = weeksWithVisits.size;
  const averageVisitsPerWeek =
    numberOfWeeksWithVisits > 0 ? totalVisits / numberOfWeeksWithVisits : 0;

  return [chartData, currentWeekVisits, averageVisitsPerWeek];
}

function calculateVisitPercentage(
  currentVisits: number,
  averageVisits: number
): string {
  // Calculate the percentage difference
  const percentageDifference = (currentVisits / averageVisits - 1) * 100;

  // Format the percentage with + or - sign
  const formattedPercentage = percentageDifference.toFixed(1);
  return `${percentageDifference >= 0 ? "+" : ""}${formattedPercentage}%`;
}

interface ChartVisitsProps {
  user: User;
  className?: string;
}

export function ChartVisits({ user, className }: ChartVisitsProps) {
  const [chartDataYear, currentYearVisits, averageVisitsPerYear] =
    generateChartDataYear(user);
  const [chartDataMonth, currentMonthVisits, averageVisitsPerMonth] =
    generateChartDataMonth(user);
  const [chartDataWeek, currentWeekVisits, averageVisitsPerWeek] =
    generateChartDataWeek(user);

  return (
    <Tabs defaultValue="week" className={`${className} mt-0`}>
      <TabsContent value="week" className="mt-0 h-full">
        <Card className="h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row justify-between">
            <div className="space-y-1.5">
              <CardTitle>Visits</CardTitle>
              <CardDescription>Grouped by weekday</CardDescription>
            </div>
            <TabsList className="position-absolute right-0">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartDataWeek}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="column"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="visits" fill="var(--color-visits)" radius={8}>
                  <LabelList
                    dataKey="visits"
                    position="insideTop"
                    offset={20}
                    className="fill-primary-foreground max-md:hidden"
                    fontSize={12}
                    fontWeight={700}
                    formatter={(value: number) =>
                      value > averageVisitsPerWeek / 3 ? value : ""
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {calculateVisitPercentage(
                currentWeekVisits,
                averageVisitsPerWeek
              )}{" "}
              of average on{" "}
              {
                [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ][new Date().getDay()]
              }{" "}
              {currentWeekVisits / averageVisitsPerWeek >= 1 && (
                <TrendingUp className="h-4 w-4" />
              )}
              {currentWeekVisits / averageVisitsPerWeek < 1 && (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              Showing all your visits of this website grouped by weekday.
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="month" className="mt-0 h-full">
        <Card className="h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row justify-between">
            <div className="space-y-1.5">
              <CardTitle>Visits</CardTitle>
              <CardDescription>Grouped by month</CardDescription>
            </div>
            <TabsList className="position-absolute right-0">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartDataMonth}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="column"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="visits" fill="var(--color-visits)" radius={8}>
                  <LabelList
                    dataKey="visits"
                    position="insideTop"
                    offset={20}
                    className="fill-primary-foreground max-md:hidden"
                    fontSize={12}
                    fontWeight={700}
                    formatter={(value: number) =>
                      value > averageVisitsPerMonth / 3 ? value : ""
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {calculateVisitPercentage(
                currentMonthVisits,
                averageVisitsPerMonth
              )}{" "}
              of average in{" "}
              {
                [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ][new Date().getMonth()]
              }{" "}
              {currentMonthVisits / averageVisitsPerMonth >= 1 && (
                <TrendingUp className="h-4 w-4" />
              )}
              {currentMonthVisits / averageVisitsPerMonth < 1 && (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              Showing all your visits of this website grouped by month.
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="year" className="mt-0 h-full">
        <Card className="h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row justify-between">
            <div className="space-y-1.5">
              <CardTitle>Visits</CardTitle>
              <CardDescription>Grouped by year</CardDescription>
            </div>
            <TabsList className="position-absolute right-0">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartDataYear}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="column"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="visits" fill="var(--color-visits)" radius={8}>
                  <LabelList
                    dataKey="visits"
                    position="insideTop"
                    offset={20}
                    className="fill-primary-foreground max-md:hidden"
                    fontSize={12}
                    fontWeight={700}
                    formatter={(value: number) =>
                      value > averageVisitsPerYear / 3 ? value : ""
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {calculateVisitPercentage(
                currentYearVisits,
                averageVisitsPerYear
              )}{" "}
              of average in {new Date().getFullYear()}{" "}
              {currentYearVisits / averageVisitsPerYear >= 1 && (
                <TrendingUp className="h-4 w-4" />
              )}
              {currentYearVisits / averageVisitsPerYear < 1 && (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              Showing all your visits of this website grouped by year.
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
