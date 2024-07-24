import { Version } from "@/models";

export function sameVersion(version1: Version, version2: Version): boolean {
    if (!version1) return false;
    if (!version2) return false;
    return version1.major === version2.major && version1.minor === version2.minor && version1.patch === version2.patch;
}

export function compareVersion(version1: Version, version2: Version): number {
    if (version1.major > version2.major) {
        return 1;
    } else if (version1.major < version2.major) {
        return -1;
    } else if (version1.minor > version2.minor) {
        return 1;
    } else if (version1.minor < version2.minor) {
        return -1;
    } else if (version1.patch > version2.patch) {
        return 1;
    } else if (version1.patch < version2.patch) {
        return -1;
    } else {
        return 0;
    }
}

export function versionToString(version: Version): string {
    return `${version.major}.${version.minor}.${version.patch}`;
}
