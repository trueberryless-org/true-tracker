import { User, Version } from "@/models";
import { sameVersion } from "./versionUtils";

type UpgradeFunction = (data: any) => any;

var upgradeFunctions: Map<string, UpgradeFunction> = new Map();

export function registerUpgradeFunction(
    fromVersion: Version,
    toVersion: Version,
    fn: UpgradeFunction
) {
    const key = `${fromVersion.major}.${fromVersion.minor}.${fromVersion.patch}->${toVersion.major}.${toVersion.minor}.${toVersion.patch}`;
    console.log(`Registering upgrade function: ${key}`);
    upgradeFunctions.set(key, fn);
}

export function upgradeData(data: any, targetVersion: Version): User {
    let currentVersion = data.version;

    while (!sameVersion(currentVersion, targetVersion)) {
        const nextVersion = getNextVersion(currentVersion);
        if (!nextVersion) {
            throw new Error(`Keine nächste Version gefunden`);
            break;
        }
        console.log("Upgrade functions:", Array.from(upgradeFunctions.entries()));

        const key = `${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}->${nextVersion.major}.${nextVersion.minor}.${nextVersion.patch}`;
        const upgradeFunction = upgradeFunctions.get(key);
        console.log(upgradeFunction);
        if (!upgradeFunction) {
            throw new Error(
                `Keine Upgrade-Funktion gefunden für Version ${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch} -> ${nextVersion.major}.${nextVersion.minor}.${nextVersion.patch}`
            );
        }

        data = upgradeFunction(data);
        data.version = nextVersion;
        currentVersion = nextVersion;
    }

    return data;
}

function getNextVersion(currentVersion: Version): Version | null {
    for (const key of upgradeFunctions.keys()) {
        const [fromVersion] = key.split("->");
        const [fromMajor, fromMinor, fromPatch] = fromVersion.split(".").map(Number);

        if (
            currentVersion.major === fromMajor &&
            currentVersion.minor === fromMinor &&
            currentVersion.patch === fromPatch
        ) {
            const [, toVersion] = key.split("->");
            const [toMajor, toMinor, toPatch] = toVersion.split(".").map(Number);
            return { major: toMajor, minor: toMinor, patch: toPatch };
        }
    }
    return null;
}
