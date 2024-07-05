export default interface Task {
    id: string;
    name: string;
    startTime: Date;
    endTime: Date | null;
    description?: string;
}
