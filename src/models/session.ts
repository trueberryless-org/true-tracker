import { Fish, PawPrint, Rabbit, Snail } from "lucide-react";

export type Flow = (typeof flows)[number]["value"];

export default interface Session {
    id: string;
    description?: string;

    flow: Flow;

    start: Date;
    end: Date | null;
}

export const flows = [
    {
        value: "smooth",
        label: "Smooth Flow",
        icon: Rabbit,
    },
    {
        value: "good",
        label: "Good Flow",
        icon: PawPrint,
    },
    {
        value: "neutral",
        label: "Neutral Flow",
        icon: Fish,
    },
    {
        value: "disrupted",
        label: "Disrupted Flow",
        icon: Snail,
    },
];
