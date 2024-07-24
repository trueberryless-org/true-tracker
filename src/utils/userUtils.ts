import version from "@/constants/version";
import { User } from "@/models";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { exportData } from "./export";
import { loadData } from "./load";
import { saveData } from "./save";
import { isSessionInDateRange } from "./sessionUtils";
import { initializeUpgradeFunctions } from "./upgradeFunctions";
import { upgradeData } from "./upgradeUtils";
import { sameVersion } from "./versionUtils";

export function loadUserAndUpdateVersion(setUser: (user: User) => void) {
    let data = loadData();
    if (data) {
        if (!sameVersion(data.version, version)) {
            initializeUpgradeFunctions();
            exportData();
            if (!data.version) data.version = { major: 0, minor: 1, patch: 0 };
            data = upgradeData(data, version);
            toast("We migrate your data to the latest version.");
        }
        data.visits = [{ id: crypto.randomUUID(), time: new Date() }, ...data.visits];
        setUser(data);
        saveData(data);
    }
}

export function getMostRecentSessionDateOfUser(user: User): Date {
    const dates = user.projects
        .flatMap((project) => project.tasks.flatMap((task) => task.sessions))
        .map((session) => new Date(session.end ?? session.start).getTime());
    return new Date(Math.max(...dates));
}

export function getMostRecentSessionDateInIntervalOfUser(user: User, dateRange: DateRange): Date {
    const dates = user.projects
        .flatMap((project) => project.tasks.flatMap((task) => task.sessions))
        .filter((session) => isSessionInDateRange(session, dateRange))
        .map((session) => new Date(session.end ?? session.start).getTime());
    return new Date(Math.max(...dates));
}
