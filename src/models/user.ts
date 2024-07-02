import { Project } from "./project";

export default interface User {
    username: string;
    projects: Project[];
}
