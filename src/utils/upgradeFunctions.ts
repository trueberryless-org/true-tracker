import { AutomationSettings, automationSettings } from "@/models/settings";
import { registerUpgradeFunction } from "./upgradeUtils";

export function initializeUpgradeFunctions() {
    registerUpgradeFunction(
        { major: 0, minor: 1, patch: 0 },
        { major: 0, minor: 2, patch: 0 },
        upgradeFrom010To020
    );
    registerUpgradeFunction(
        { major: 0, minor: 2, patch: 0 },
        { major: 0, minor: 3, patch: 0 },
        upgradeFrom020To030
    );
}

function upgradeFrom010To020(data: any): any {
    // Upgrade Logic von Version 0.1.0 auf 0.2.0
    data.projects.forEach((project: any) => {
        project.tasks.forEach((task: any) => {
            task.sessions.forEach((session: any, index: number) => {
                task.sessions[index] = {
                    id: crypto.randomUUID(),
                    flow: "good",
                    ...session,
                };
            });
        });
    });

    return data;
}

function upgradeFrom020To030(data: any): any {
    // Upgrade Logic von Version 0.2.0 auf 0.3.0
    data.id = crypto.randomUUID();

    data.settings = {
        theme: data.theme || "default",
        exportReminder: data.exportReminder || "weekly",
        lastExported: data.lastExported || new Date(),
        automation: {
            ...automationSettings.reduce((acc: any, setting) => {
                acc[setting.key] = true;
                return acc;
            }, {}),
            ...(data.settings?.automation || {}),
        },
        ...data.settings,
    };

    delete data.theme;
    delete data.exportReminder;
    delete data.lastExported;

    data.visits = [];

    return data;
}
