import React from "react";
import { flows } from "@/models/session"; // Adjust the import path as needed

interface FlowIconLabelProps {
    flowValue: string;
    justify?: "left" | "right";
    className?: string;
}

const FlowIconLabel: React.FC<FlowIconLabelProps> = ({ flowValue, justify, className }) => {
    const flow = flows.find((flow) => flow.value === flowValue);

    if (!flow) {
        return null;
    }

    const Icon = flow.icon;
    const justifyClass = justify === "right" ? "justify-end" : "justify-start";
    return (
        <div className={`flex items-center ${justifyClass} ${className}`}>
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            <span>{flow.label}</span>
        </div>
    );
};

export default FlowIconLabel;
