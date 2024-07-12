export function formatDateToDistanceFromNow(date: Date): string {
    // Check if date is valid
    if (!(date instanceof Date && !isNaN(date.getTime()))) {
        return "Invalid Date";
    }

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    // Define time intervals in seconds
    const intervals = {
        year: 31536000,
        month: 2592000,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    // Find the most relevant interval
    for (const [unit, secondsPerUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsPerUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? "s" : ""} ago`;
        }
    }

    return "Just now";
}

export function formatDateTime(date: Date): string {
    // Check if date is valid
    if (!(date instanceof Date && !isNaN(date.getTime()))) {
        return "Invalid Date";
    }

    const now = new Date();

    // Check if the date is within the current day
    if (
        now.getDate() === date.getDate() &&
        now.getMonth() === date.getMonth() &&
        now.getFullYear() === date.getFullYear()
    ) {
        // Format time for today's date
        return formatDateToTime(date);
    } else {
        // Format date for other dates
        return formatDateToDate(date);
    }
}

function formatDateToTime(date: Date): string {
    // Format time (e.g., 10:45 pm)
    const options: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    };
    return date.toLocaleTimeString([], options);
}

function formatDateToDate(date: Date): string {
    // Format date (e.g., 30 May)
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return date.toLocaleDateString([], options);
}

export const msToTime = (duration: number) => {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    // Initialize an array to store non-zero time components
    let timeComponents: string[] = [];

    if (hours > 0) {
        timeComponents.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    }
    if (minutes > 0) {
        timeComponents.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    }
    if (seconds > 0 || timeComponents.length === 0) {
        timeComponents.push(`${seconds} second${seconds > 1 ? "s" : ""}`);
    }

    // Join time components with commas and return as a single string
    return timeComponents.join(", ");
};
