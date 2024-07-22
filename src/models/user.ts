import Project from "./project";
import Settings from "./settings";
import Version from "./version";
import Visit from "./visit";

export default interface User {
    id: string;
    username: string;
    profilePicture?: string | null;
    settings: Settings;

    projects: Project[];

    visits: Visit[];
    version: Version;
}
