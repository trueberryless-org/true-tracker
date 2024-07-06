"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { User } from "@/models";
import { useUser } from "./UserContext";
import { saveData } from "@/utils/save";
import { useState } from "react";
import { importData } from "@/utils/import";

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
                toast({
                    title: "Error importing data. Please try again.",
                });
            }
        } else {
            console.error("No file data to import");
        }
    };

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const newUser: User = {
            username: data.username,
            projects: [],
            lastExported: new Date(),
            exportReminder: "weekly",
        };
        setUser(newUser);
        saveData(newUser);
        toast({
            title: 'You sign up with the username "' + data.username + '".',
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
                                        <CardDescription>
                                            Enter your information to create an account.
                                        </CardDescription>
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
                                                                <Input
                                                                    placeholder="imcool"
                                                                    {...field}
                                                                />
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
                                    <Input
                                        type="file"
                                        accept="application/json"
                                        onChange={saveFileTemp}
                                    />
                                </div>
                                <Button onClick={importNow} className="w-full">
                                    Import user data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
