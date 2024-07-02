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
        }
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return <div></div>;
};

export default Home;
