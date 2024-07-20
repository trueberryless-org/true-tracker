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
        timeComponents.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    }
    if (minutes > 0) {
        timeComponents.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    }
    if (seconds > 0 || timeComponents.length === 0) {
        timeComponents.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
    }

    // Join time components with commas and return as a single string
    return timeComponents.join(", ");
};

export const msToShortTime = (duration: number) => {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    // Initialize an array to store non-zero time components
    let timeComponents: string[] = [];

    if (hours > 0) {
        timeComponents.push(`${hours}h`);
    }
    if (minutes > 0) {
        timeComponents.push(`${minutes}m`);
    }
    if (seconds > 0 || timeComponents.length === 0) {
        timeComponents.push(`${seconds}s`);
    }

    // Join time components with commas and return as a single string
    return timeComponents.join(" ");
};

export const msToTimeHours = (duration: number) => {
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    return `${hours}h`;
};

export const msToTimeMinutes = (duration: number) => {
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    return `${minutes}m`;
};

export const msToTimeSeconds = (duration: number) => {
    let seconds = Math.floor((duration / 1000) % 60);
    return `${seconds}s`;
};

export const msToTimeFitting = (duration: number) => {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    if (hours > 0) {
        return `${hours}h`;
    }
    if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${seconds}s`;
};

/**
 * regular expression to check for valid hour format (01-23)
 */
export function isValidHour(value: string) {
    return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
export function isValid12Hour(value: string) {
    return /^(0[1-9]|1[0-2])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
export function isValidMinuteOrSecond(value: string) {
    return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

export function getValidNumber(
    value: string,
    { max, min = 0, loop = false }: GetValidNumberConfig
) {
    let numericValue = parseInt(value, 10);

    if (!isNaN(numericValue)) {
        if (!loop) {
            if (numericValue > max) numericValue = max;
            if (numericValue < min) numericValue = min;
        } else {
            if (numericValue > max) numericValue = min;
            if (numericValue < min) numericValue = max;
        }
        return numericValue.toString().padStart(2, "0");
    }

    return "00";
}

export function getValidHour(value: string) {
    if (isValidHour(value)) return value;
    return getValidNumber(value, { max: 23 });
}

export function getValid12Hour(value: string) {
    if (isValid12Hour(value)) return value;
    return getValidNumber(value, { min: 1, max: 12 });
}

export function getValidMinuteOrSecond(value: string) {
    if (isValidMinuteOrSecond(value)) return value;
    return getValidNumber(value, { max: 59 });
}

type GetValidArrowNumberConfig = {
    min: number;
    max: number;
    step: number;
};

export function getValidArrowNumber(value: string, { min, max, step }: GetValidArrowNumberConfig) {
    let numericValue = parseInt(value, 10);
    if (!isNaN(numericValue)) {
        numericValue += step;
        return getValidNumber(String(numericValue), { min, max, loop: true });
    }
    return "00";
}

export function getValidArrowHour(value: string, step: number) {
    return getValidArrowNumber(value, { min: 0, max: 23, step });
}

export function getValidArrow12Hour(value: string, step: number) {
    return getValidArrowNumber(value, { min: 1, max: 12, step });
}

export function getValidArrowMinuteOrSecond(value: string, step: number) {
    return getValidArrowNumber(value, { min: 0, max: 59, step });
}

export function setMinutes(date: Date, value: string) {
    const minutes = getValidMinuteOrSecond(value);
    date.setMinutes(parseInt(minutes, 10));
    return date;
}

export function setSeconds(date: Date, value: string) {
    const seconds = getValidMinuteOrSecond(value);
    date.setSeconds(parseInt(seconds, 10));
    return date;
}

export function setHours(date: Date, value: string) {
    const hours = getValidHour(value);
    date.setHours(parseInt(hours, 10));
    return date;
}

export function set12Hours(date: Date, value: string, period: Period) {
    const hours = parseInt(getValid12Hour(value), 10);
    const convertedHours = convert12HourTo24Hour(hours, period);
    date.setHours(convertedHours);
    return date;
}

export type TimePickerType = "minutes" | "seconds" | "hours" | "12hours";
export type Period = "AM" | "PM";

export function setDateByType(date: Date, value: string, type: TimePickerType, period?: Period) {
    switch (type) {
        case "minutes":
            return setMinutes(date, value);
        case "seconds":
            return setSeconds(date, value);
        case "hours":
            return setHours(date, value);
        case "12hours": {
            if (!period) return date;
            return set12Hours(date, value, period);
        }
        default:
            return date;
    }
}

export function getDateByType(date: Date, type: TimePickerType) {
    switch (type) {
        case "minutes":
            return getValidMinuteOrSecond(String(date.getMinutes()));
        case "seconds":
            return getValidMinuteOrSecond(String(date.getSeconds()));
        case "hours":
            return getValidHour(String(date.getHours()));
        case "12hours":
            const hours = display12HourValue(date.getHours());
            return getValid12Hour(String(hours));
        default:
            return "00";
    }
}

export function getArrowByType(value: string, step: number, type: TimePickerType) {
    switch (type) {
        case "minutes":
            return getValidArrowMinuteOrSecond(value, step);
        case "seconds":
            return getValidArrowMinuteOrSecond(value, step);
        case "hours":
            return getValidArrowHour(value, step);
        case "12hours":
            return getValidArrow12Hour(value, step);
        default:
            return "00";
    }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
export function convert12HourTo24Hour(hour: number, period: Period) {
    if (period === "PM") {
        if (hour <= 11) {
            return hour + 12;
        } else {
            return hour;
        }
    } else if (period === "AM") {
        if (hour === 12) return 0;
        return hour;
    }
    return hour;
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
export function display12HourValue(hours: number) {
    if (hours === 0 || hours === 12) return "12";
    if (hours >= 22) return `${hours - 12}`;
    if (hours % 12 > 9) return `${hours}`;
    return `0${hours % 12}`;
}
