import React from "react";
import { priorities } from "@/models/project"; // Adjust the import path as needed

interface PriorityIconLabelProps {
    priorityValue: string;
}

const PriorityIconLabel: React.FC<PriorityIconLabelProps> = ({ priorityValue }) => {
    const priority = priorities.find((priority) => priority.value === priorityValue);

    if (!priority) {
        return null;
    }

    const Icon = priority.icon;
    return (
        <div className="flex items-center">
            {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground" />}
            <span>{priority.label}</span>
        </div>
    );
};

export default PriorityIconLabel;
