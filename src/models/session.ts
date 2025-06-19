import { Fish, PawPrint, Rabbit, Snail } from "lucide-react";

export type Flow = (typeof flows)[number]["value"];

export default interface Session {
  id: string;
  description?: string;

  flow: Flow;

  start: Date;
  end: Date | null;
}

export interface ExtendedSession extends Session {
  projectName: string;
  projectIsArchived: boolean;
  taskName: string;
}

export const flows = [
  {
    value: "smooth",
    label: "Smooth",
    icon: Rabbit,
  },
  {
    value: "good",
    label: "Good",
    icon: PawPrint,
  },
  {
    value: "neutral",
    label: "Neutral",
    icon: Fish,
  },
  {
    value: "disrupted",
    label: "Disrupted",
    icon: Snail,
  },
];
