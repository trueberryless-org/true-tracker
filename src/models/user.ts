import { Project } from "./project";

export interface User {
    username: string;
    projects: Project[];
}

export default User;
