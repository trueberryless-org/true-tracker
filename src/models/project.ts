import { Task } from "./task";

export interface Project {
    id: string;
    name: string;
    tasks: Task[];
}

export default Project;
