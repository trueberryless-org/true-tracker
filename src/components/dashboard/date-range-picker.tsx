"use client";

import { cn } from "@/lib/utils";
import { addMonths, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { ActiveModifiers, DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CalendarDateRangePickerProps {
    dateRange: DateRange | undefined;
    setDateRange: (date: DateRange | undefined) => void;
}

export const CalendarDateRangePicker = React.forwardRef<HTMLButtonElement, CalendarDateRangePickerProps>(
    ({ dateRange, setDateRange }, ref) => {
        return (
            <div className={cn("grid gap-2")}>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            ref={ref}
                            variant={"outline"}
                            className={cn(
                                "w-[260px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={
                                dateRange?.to
                                    ? addMonths(dateRange.to, -1)
                                    : dateRange?.from
                                      ? addMonths(dateRange.from, -1)
                                      : addMonths(new Date(), -1)
                            }
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        );
    },
);

CalendarDateRangePicker.displayName = "CalendarDateRangePicker";
