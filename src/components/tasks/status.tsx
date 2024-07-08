import React from "react";
import { statuses } from "@/models/task"; // Adjust the import path as needed

interface StatusIconLabelProps {
    statusValue: string;
    justify?: "left" | "right";
    className?: string;
}

const StatusIconLabel: React.FC<StatusIconLabelProps> = ({ statusValue, justify, className }) => {
    const status = statuses.find((status) => status.value === statusValue);

    if (!status) {
        return null;
    }

    const Icon = status.icon;
    const justifyClass = justify === "right" ? "justify-end" : "justify-start";
    return (
        <div className={`flex items-center ${justifyClass} ${className}`}>
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            <span>{status.label}</span>
        </div>
    );
};

export default StatusIconLabel;
