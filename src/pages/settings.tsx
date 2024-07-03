import { useState, useEffect } from "react";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { User } from "../models";
import { saveData } from "../utils/save";
import { loadData } from "../utils/load";
import { importData } from "../utils/import";
import { exportData } from "../utils/export";
import { setSessionStorageItem, getSessionStorageItem } from "../utils/sessionStorage";

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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/components/UserContext";
import { clearLocalStorage } from "@/utils/localStorage";

const FormSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
});

export default function Settings() {
    const { user, setUser } = useUser();
    const [fileData, setFileData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("General"); // State to track active tab

    useEffect(() => {
        const data = loadData();
        if (data) {
            setUser(data);
        }

        // Retrieve active tab from sessionStorage on component mount
        const storedTab = getSessionStorageItem("activeTab");
        if (storedTab) {
            setActiveTab(storedTab.toString());
        }
    }, []);

    // Function to handle tab click and save active tab in sessionStorage
    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
        setSessionStorageItem("activeTab", tabName);
    };

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: user?.username || "",
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        if (data && user) {
            const updatedUser = { ...user, username: data.username };
            setUser(updatedUser);
            saveData(updatedUser);
            toast({
                title: 'You changed your username to "' + data.username + '".',
            });
        }
    }

    const saveFileTemp = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const file = event.target.files[0];
            setFileData(file);
        }
    };

    const importNow = () => {
        if (fileData) {
            try {
                importData(fileData)
                    .then((importedUser: User) => {
                        setUser(importedUser);
                        toast({
                            title: "Data imported successfully.",
                        });
                    })
                    .catch((error) => console.error("Error importing data", error));
            } catch (error) {
                console.error("Error parsing JSON file", error);
                toast({
                    title: "Error importing data. Please try again.",
                });
            }
        } else {
            console.error("No file data to import");
        }
    };

    const deleteAllProjects = () => {
        if (
            confirm("Are you sure you want to delete all projects? This action cannot be undone.")
        ) {
            if (user) {
                const updatedUser = { ...user, projects: [] };
                setUser(updatedUser);
                saveData(updatedUser);
            }
        }
    };

    const clearAllUserData = () => {
        if (
            confirm("Are you sure you want to delete all your data? This action cannot be undone.")
        ) {
            clearLocalStorage();
            setUser(null);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex w-full flex-col">
            <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav
                        className="grid gap-4 text-sm text-muted-foreground"
                        x-chunk="dashboard-04-chunk-0"
                    >
                        <a
                            className={` ${
                                activeTab === "General" ? "font-semibold text-primary" : ""
                            }`}
                            onClick={() => handleTabClick("General")}
                        >
                            General
                        </a>
                        <a
                            className={` ${
                                activeTab === "Data Management" ? "font-semibold text-primary" : ""
                            }`}
                            onClick={() => handleTabClick("Data Management")}
                        >
                            Data Management
                        </a>
                        <a
                            className={` ${
                                activeTab === "Danger Zone" ? "font-semibold text-primary" : ""
                            }`}
                            onClick={() => handleTabClick("Danger Zone")}
                        >
                            Danger Zone
                        </a>
                    </nav>
                    {/* Render content based on activeTab */}
                    {activeTab === "General" && (
                        <div className="grid gap-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <Card x-chunk="dashboard-04-chunk-1">
                                        <CardHeader>
                                            <CardTitle>Username</CardTitle>
                                            <CardDescription>
                                                This is your display name.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <FormField
                                                control={form.control}
                                                name="username"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={user?.username}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                        <CardFooter className="border-t px-6 py-4">
                                            <Button type="submit">Save</Button>
                                        </CardFooter>
                                    </Card>
                                </form>
                            </Form>
                        </div>
                    )}
                    {activeTab === "Data Management" && (
                        <div className="grid gap-6">
                            <Card x-chunk="dashboard-04-chunk-1">
                                <CardHeader>
                                    <CardTitle>Export data</CardTitle>
                                    <CardDescription>
                                        This will generate a JSON with your data, so you can import
                                        it again later.
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
                    )}
                    {activeTab === "Danger Zone" && (
                        <div className="grid gap-6">
                            <Card x-chunk="dashboard-04-chunk-1">
                                <CardHeader>
                                    <CardTitle>Delete all projects</CardTitle>
                                    <CardDescription>
                                        This will delete all projects with their time entries.{" "}
                                        <br />
                                        Please consider exporting before proceeding.
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="border-t px-6 py-4">
                                    <Button onClick={deleteAllProjects} variant={"destructive"}>
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                            <Card x-chunk="dashboard-04-chunk-1">
                                <CardHeader>
                                    <CardTitle>Delete all data</CardTitle>
                                    <CardDescription>
                                        All your projects, time entries and everything else will be
                                        completely erased from existence. <br />
                                        Please consider exporting before proceeding.
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="border-t px-6 py-4">
                                    <Button onClick={clearAllUserData} variant={"destructive"}>
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
