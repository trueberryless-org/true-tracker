import { useState, useEffect } from "react";
import { User, Project, Task } from "../models";
import { saveData } from "../utils/save";
import { loadData } from "@/utils/load";
import { importData } from "@/utils/import";
import { exportData } from "@/utils/export";

const Home = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const data = loadData();
        if (data) {
            setUser(data);
        } else {
            const username = prompt("Enter your username");
            if (username) {
                const newUser: User = { username, projects: [] };
                setUser(newUser);
                saveData(newUser);
            }
        }
    }, []);

    const addProject = (name: string) => {
        if (!user) return;
        const newProject: Project = { id: String(Date.now()), name, tasks: [] };
        const updatedUser = { ...user, projects: [...user.projects, newProject] };
        setUser(updatedUser);
        saveData(updatedUser);
    };

    const deleteProject = (projectId: string) => {
        if (!user) return;
        const updatedProjects = user.projects.filter((project) => project.id !== projectId);
        const updatedUser = { ...user, projects: updatedProjects };
        setUser(updatedUser);
        saveData(updatedUser);
    };

    const addTask = (projectId: string, task: Omit<Task, "id">) => {
        if (!user) return;
        const updatedProjects = user.projects.map((project) =>
            project.id === projectId
                ? {
                      ...project,
                      tasks: [
                          ...project.tasks,
                          {
                              ...task,
                              id: String(Date.now()),
                          },
                      ],
                  }
                : project
        );
        const updatedUser = { ...user, projects: updatedProjects };
        setUser(updatedUser);
        saveData(updatedUser);
    };

    const deleteTask = (projectId: string, taskId: string) => {
        if (!user) return;
        const updatedProjects = user.projects.map((project) =>
            project.id === projectId
                ? {
                      ...project,
                      tasks: project.tasks.filter((task) => task.id !== taskId),
                  }
                : project
        );
        const updatedUser = { ...user, projects: updatedProjects };
        setUser(updatedUser);
        saveData(updatedUser);
    };

    const startTask = (projectId: string, taskId: string) => {
        if (!user) return;
        const updatedProjects = user.projects.map((project) =>
            project.id === projectId
                ? {
                      ...project,
                      tasks: project.tasks.map((task) =>
                          task.id === taskId ? { ...task, startTime: new Date() } : task
                      ),
                  }
                : project
        );
        const updatedUser = { ...user, projects: updatedProjects };
        setUser(updatedUser);
        saveData(updatedUser);
    };

    const stopTask = (projectId: string, taskId: string) => {
        if (!user) return;
        const updatedProjects = user.projects.map((project) =>
            project.id === projectId
                ? {
                      ...project,
                      tasks: project.tasks.map((task) =>
                          task.id === taskId ? { ...task, endTime: new Date() } : task
                      ),
                  }
                : project
        );
        const updatedUser = { ...user, projects: updatedProjects };
        setUser(updatedUser);
        saveData(updatedUser);
    };

    const changeUsername = () => {
        const newUsername = prompt("Enter your new username");
        if (newUsername && user) {
            const updatedUser = { ...user, username: newUsername };
            setUser(updatedUser);
            saveData(updatedUser);
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            importData(event.target.files[0])
                .then((data) => setUser(data))
                .catch((error) => console.error("Error importing data", error));
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Time Tracker</h1>
            <button onClick={exportData}>Export Data</button>
            <input type="file" accept="application/json" onChange={handleImport} />
            <div>
                <h2>Welcome, {user.username}</h2>
                <button onClick={changeUsername}>Change Username</button>
                <h2>Projects</h2>
                <button onClick={() => addProject(prompt("Project name") || "")}>
                    Add Project
                </button>
                {user.projects.map((project) => (
                    <div key={project.id}>
                        <h3>{project.name}</h3>
                        <button onClick={() => deleteProject(project.id)}>Delete Project</button>
                        <button
                            onClick={() =>
                                addTask(project.id, {
                                    name: prompt("Task name") || "",
                                    startTime: new Date(),
                                    endTime: null,
                                    description: prompt("Task description"),
                                })
                            }
                        >
                            Add Task
                        </button>
                        <ul>
                            {project.tasks.map((task) => (
                                <li key={task.id}>
                                    {task.name}{" "}
                                    <button
                                        onClick={() => startTask(project.id, task.id)}
                                        disabled={!!task.startTime}
                                    >
                                        Start
                                    </button>{" "}
                                    <button
                                        onClick={() => stopTask(project.id, task.id)}
                                        disabled={!task.startTime || !!task.endTime}
                                    >
                                        Stop
                                    </button>{" "}
                                    <button onClick={() => deleteTask(project.id, task.id)}>
                                        Delete Task
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
