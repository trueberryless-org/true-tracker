import { useState, useEffect } from "react";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { User } from "../../models";
import { saveData } from "../../utils/save";
import { loadData } from "@/utils/load";
import { importData } from "@/utils/import";
import { exportData } from "@/utils/export";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export default function Settings() {
    const [user, setUser] = useState<User | null>(null);
    const [fileData, setFileData] = useState<any>(null);

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

    // Function to handle file input change
    const saveFileTemp = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const jsonData = JSON.parse(content);
                    setFileData(jsonData); // Store file data in state
                } catch (error) {
                    console.error("Error parsing JSON file", error);
                }
            };
            reader.readAsText(file);
        }
    };

    // Function to handle import button click
    const importNow = () => {
        if (fileData) {
            importData(fileData) // Assuming importData handles the import operation
                .then((importedUser: User) => {
                    setUser(importedUser);
                    // Optionally save imported data to local storage or perform other actions
                    // saveData(importedUser);
                })
                .catch((error) => console.error("Error importing data", error));
        } else {
            console.error("No file data to import");
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav
                        className="grid gap-4 text-sm text-muted-foreground"
                        x-chunk="dashboard-04-chunk-0"
                    >
                        <Link href="/settings">General</Link>
                        <Link
                            href="/settings/data-management"
                            className="font-semibold text-primary"
                        >
                            Data Management
                        </Link>
                    </nav>
                    <div className="grid gap-6">
                        <Card x-chunk="dashboard-04-chunk-1">
                            <CardHeader>
                                <CardTitle>Export data</CardTitle>
                                <CardDescription>
                                    This will generate a JSON with your data, so you can import it
                                    again later.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="border-t px-6 py-4">
                                <Button onClick={exportData}>Export</Button>
                            </CardFooter>
                        </Card>
                        <Card x-chunk="dashboard-04-chunk-1">
                            <CardHeader>
                                <CardTitle>Import data</CardTitle>
                                <CardDescription>
                                    Import you recently exported data here.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    type="file"
                                    accept="application/json"
                                    onChange={saveFileTemp}
                                />
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button onClick={importNow}>Import</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
