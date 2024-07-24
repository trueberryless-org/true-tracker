import { cn } from "@/lib/utils";
import { Project } from "@/models";
import { Column } from "@tanstack/react-table";
import { CheckIcon, CirclePlusIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";

interface DataTableFacetedFilterProps<TData, TValue> {
    column?: Column<TData, TValue>;
    title?: string;
    options: string[];
    onFilterChange: (value: string[]) => void;
}

export function DataTableFacetedFilterSimple<TData, TValue>({
    column,
    title,
    options,
    onFilterChange,
}: DataTableFacetedFilterProps<TData, TValue>) {
    const facets = column?.getFacetedUniqueValues();
    const selectedValues = new Set(column?.getFilterValue() as string[]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <CirclePlusIcon className="mr-2 h-4 w-4" />
                    {title}
                    {selectedValues?.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                        {selectedValues.size} selected
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => selectedValues.has(option))
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {option}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selectedValues.has(option);
                                return (
                                    <CommandItem
                                        key={option}
                                        onSelect={() => {
                                            if (isSelected) {
                                                selectedValues.delete(option);
                                            } else {
                                                selectedValues.add(option);
                                            }
                                            const filterValues = Array.from(selectedValues);
                                            column?.setFilterValue(filterValues.length ? filterValues : undefined);
                                            onFilterChange(filterValues);
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible",
                                            )}
                                        >
                                            <CheckIcon className={cn("h-4 w-4")} />
                                        </div>
                                        <span>{option}</span>
                                        {facets?.get(option) && (
                                            <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                                                {facets.get(option)}
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => {
                                            column?.setFilterValue(undefined);
                                            onFilterChange([]);
                                        }}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
