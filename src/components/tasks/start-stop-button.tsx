import React, { useEffect, useRef, useState } from "react";
import { Session, Task } from "@/models";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

interface TaskCardProps {
    task: Task;
    onSessionChange: (taskId: string, newSession: Session) => void;
    activeText?: string;
    inactiveText?: string;
    showElapsedTime?: boolean;
}

const defaultProps: Partial<TaskCardProps> = {
    activeText: "Stop Tracking",
    inactiveText: "Start Tracking",
    showElapsedTime: false,
};

const StartStopButton: React.FC<TaskCardProps> = ({
    task,
    onSessionChange,
    showElapsedTime,
    activeText,
    inactiveText,
}) => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>(0); // In Sekunden
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const ongoingSession = task.sessions.find((session) => !session.end);
        if (ongoingSession) {
            setCurrentSession(ongoingSession);
            setIsRunning(true);
            const startTime = new Date(ongoingSession.start).getTime();
            const updateElapsedTime = () => {
                const now = new Date().getTime();
                const elapsedSeconds = Math.floor((now - startTime) / 1000);
                setElapsedTime(elapsedSeconds);
            };

            intervalRef.current = setInterval(updateElapsedTime, 1000);
            updateElapsedTime();

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        } else {
            setCurrentSession(null);
            setIsRunning(false);
            setElapsedTime(0);
        }
    }, [task]);

    const handleButtonClick = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        if (isRunning) {
            // Stop the current Session
            if (currentSession) {
                const updatedSession = {
                    ...currentSession,
                    end: new Date(),
                };
                onSessionChange(task.id, updatedSession);
                setCurrentSession(null);
                setElapsedTime(0);
            }
            setIsRunning(false);
        } else {
            // Start a new Session
            const newSession: Session = {
                id: crypto.randomUUID(),
                flow: "good",
                start: new Date(),
                end: null,
            };
            setCurrentSession(newSession);
            onSessionChange(task.id, newSession);
            setIsRunning(true);
        }
    };

    const formatElapsedTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours > 0 ? hours + "h " : ""}${
            minutes > 0 ? minutes + "m " : ""
        }${remainingSeconds}s`;
    };

    return (
        <div className="flex flex-row gap-4 items-center">
            <Button onClick={handleButtonClick}>{isRunning ? activeText : inactiveText}</Button>
            {isRunning && showElapsedTime && (
                <p>•&nbsp;&nbsp;&nbsp;Current Session: {formatElapsedTime(elapsedTime)}</p>
            )}
        </div>
    );
};

StartStopButton.defaultProps = defaultProps;
export default StartStopButton;
