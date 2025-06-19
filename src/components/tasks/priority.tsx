import React from "react";

import { priorities } from "@/models/task";

// Adjust the import path as needed

interface PriorityIconLabelProps {
  priorityValue: string;
  justify?: "left" | "right";
  className?: string;
}

const PriorityIconLabel: React.FC<PriorityIconLabelProps> = ({
  priorityValue,
  justify,
  className,
}) => {
  const priority = priorities.find(
    (priority) => priority.value === priorityValue
  );

  if (!priority) {
    return null;
  }

  const Icon = priority.icon;
  const justifyClass = justify === "right" ? "justify-end" : "justify-start";
  return (
    <div
      className={`flex items-center ${justifyClass} ${className} whitespace-nowrap`}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span>{priority.label}</span>
    </div>
  );
};

export default PriorityIconLabel;
