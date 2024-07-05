import React from "react";
import { statuses } from "@/models/project"; // Adjust the import path as needed

interface StatusIconLabelProps {
    statusValue: string;
}

const StatusIconLabel: React.FC<StatusIconLabelProps> = ({ statusValue }) => {
    const status = statuses.find((status) => status.value === statusValue);

    if (!status) {
        return null;
    }

    const Icon = status.icon;
    return (
        <div className="flex items-center">
            {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground" />}
            <span>{status.label}</span>
        </div>
    );
};

export default StatusIconLabel;
