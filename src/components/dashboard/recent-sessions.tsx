import { Session } from "@/models";
import { format, isToday } from "date-fns";
import { Fish, PawPrint, Rabbit, Snail } from "lucide-react";
import Link from "next/link";
import { DateRange } from "react-day-picker";

import { msToShortTime } from "@/utils/dateUtils";
import { getProjectOfSession, getSessionDuration, getTaskOfSession } from "@/utils/sessionUtils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useUser } from "../UserContext";

interface RecentSessionsProps {
    dateRange: DateRange | undefined;
    limit?: number;
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({ dateRange, limit = 7 }) => {
    const { user } = useUser();

    const getTimeDescription = (session: Session) => {
        if (session.end) {
            return `${format(session.start, "MMMM d")}: ${format(
                session.start,
                "hh:mm aa",
            )} - ${format(session.end, "hh:mm aa")}`;
        }

        return `${format(session.start, "MMMM d")}: ${format(session.start, "hh:mm aa")} - Running`;
    };

    return (
        <div className="space-y-0">
            {user?.projects
                .flatMap((project) => project.tasks.flatMap((task) => task.sessions))
                .filter((session) => {
                    if (!dateRange) {
                        return true;
                    }

                    return (
                        new Date(session.end ?? session.start).getTime() >= new Date(dateRange.from!).getTime() &&
                        new Date(session.end ?? session.start).getTime() <=
                            new Date(dateRange.to!).setHours(23, 59, 59, 999)
                    );
                })
                .sort((a, b) => {
                    return new Date(b.end ?? b.start).getTime() - new Date(a.end ?? a.start).getTime();
                })
                .slice(0, limit)
                .map((session, index) => (
                    <Link
                        className="flex items-center cursor-pointer hover:bg-secondary/50 rounded-lg py-4 hover:px-4 transition-all duration-300"
                        key={index}
                        href={`/sessions/${session.id}`}
                    >
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>
                                {session.flow === "smooth" && <Rabbit className="h-4 w-4" />}
                                {session.flow === "good" && <PawPrint className="h-4 w-4" />}
                                {session.flow === "neutral" && <Fish className="h-4 w-4" />}
                                {session.flow === "disrupted" && <Snail className="h-4 w-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {getProjectOfSession(session, user)?.name} - {getTaskOfSession(session, user)?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">{getTimeDescription(session)}</p>
                        </div>
                        <div className="ml-auto font-medium">{msToShortTime(getSessionDuration(session))}</div>
                    </Link>
                ))}
        </div>
    );
};
