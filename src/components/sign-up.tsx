"use client";

import version from "@/constants/version";
import { User } from "@/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { importData } from "@/utils/import";
import { parseUser } from "@/utils/parseUtils";
import { saveData } from "@/utils/save";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUser } from "./UserContext";

const FormSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
});

export function SignUp() {
    const { setUser } = useUser();
    const [fileData, setFileData] = useState<any>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: "",
        },
    });

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
                    })
                    .catch((error) => console.error("Error importing data", error));
            } catch (error) {
                console.error("Error parsing JSON file", error);
                toast("Error importing data. Please try again.");
            }
        } else {
            console.error("No file data to import");
        }
    };

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const newUser: User = {
            id: crypto.randomUUID(),
            username: data.username,
            projects: [],
            settings: {
                lastExported: new Date(),
                exportReminder: "weekly",
                theme: "default",
                automation: {
                    projectStatusKickoff: true,
                },
            },
            visits: [],
            version: version,

            isCurrentlyInTestMode: false,
        };
        setUser(newUser);
        saveData(newUser);
        toast('You sign up with the username "' + data.username + '".');
    }

    function getRandomDateWithinLast6Months() {
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));
    }

    function getRandomDateWithinLast8Year() {
        const now = new Date();
        const eightYearsAgo = new Date();
        eightYearsAgo.setFullYear(now.getFullYear() - 8);
        return new Date(eightYearsAgo.getTime() + Math.random() * (now.getTime() - eightYearsAgo.getTime()));
    }

    function getRandomSessionDuration() {
        const minDuration = 5 * 60 * 1000; // 5 Minuten in Millisekunden
        const maxDuration = 5 * 60 * 60 * 1000; // 5 Stunden in Millisekunden
        return minDuration + Math.random() * (maxDuration - minDuration);
    }

    function generateRandomVisits(): User["visits"] {
        const visits: User["visits"] = [];

        for (let i = 0; i < 100; i++) {
            visits.push({
                id: crypto.randomUUID(),
                time: getRandomDateWithinLast8Year(),
            });
        }

        return visits;
    }

    function tryTestData(event: any): void {
        fetch("./data/test_user.json")
            .then((res) => res.json())
            .then((data) => {
                var user = parseUser(data);

                user.projects.forEach((project) => {
                    project.createdAt = getRandomDateWithinLast6Months();
                    project.lastUpdatedAt = getRandomDateWithinLast6Months();
                });

                user.projects.forEach((project) => {
                    project.tasks.forEach((task) => {
                        task.sessions.forEach((session) => {
                            session.start = getRandomDateWithinLast6Months();
                            session.end = new Date(session.start.getTime() + getRandomSessionDuration());
                        });
                    });
                });

                user.visits = generateRandomVisits();

                // Random theme
                const themes: ("default" | "sapphire" | "ruby" | "emerald" | "coral" | "amber" | "amethyst")[] = [
                    "default",
                    "sapphire",
                    "ruby",
                    "emerald",
                    "coral",
                    "amber",
                    "amethyst",
                ];
                user.settings.theme = themes[Math.floor(Math.random() * themes.length)];

                user.isCurrentlyInTestMode = true;

                setUser(user);
                saveData(user);
                toast('You can now test the application with the user "' + user.username + '".');
            });
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 justify-center">
            <main className="grid gap-4 mx-auto lg:grid-cols-9">
                <div className="flex justify-center items-center col-span-4">
                    <div className="w-full">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <Card className="mx-auto w-full">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Sign Up</CardTitle>
                                        <CardDescription>Enter your information to create an account.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name="username"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Username</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="imcool" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Button type="submit" className="w-full">
                                                Create an account
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </Form>
                    </div>
                </div>
                <div className="hidden justify-center items-center auto-cols-min lg:flex">
                    <div className="h-40 w-1 bg-primary rounded-lg"></div>
                </div>
                <div className="flex justify-center items-center col-span-4">
                    <Card className="mx-auto w-full">
                        <CardHeader>
                            <CardTitle className="text-xl">Log In</CardTitle>
                            <CardDescription>
                                You can log in by uploading previously exported user data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">User data (JSON)</Label>
                                    <Input type="file" accept="application/json" onChange={saveFileTemp} />
                                </div>
                                <div className="grid gap-2 grid-cols-3">
                                    <Button onClick={importNow} className="w-full col-span-2">
                                        Import user data
                                    </Button>
                                    <Button onClick={tryTestData} className="w-full" variant={"outline"}>
                                        Try test data
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
