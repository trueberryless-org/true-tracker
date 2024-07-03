import { useState, useEffect } from "react";
import { User, Project, Task } from "../models";
import { saveData } from "../utils/save";
import { loadData } from "@/utils/load";
import { importData } from "@/utils/import";
import { exportData } from "@/utils/export";
import Dashboard from "../components/dashboard";
import { useUser } from "@/components/UserContext";

const Home = () => {
    const { user, setUser } = useUser();

    useEffect(() => {
        const data = loadData();
        if (data) {
            setUser(data);
        }
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>User Data</h1>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <Dashboard />
        </div>
    );
};

export default Home;
