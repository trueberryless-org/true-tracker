import { AlertCircle } from "lucide-react";

import { useUser } from "@/components/UserContext";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import Dashboard from "../components/dashboard/dashboard";

export default function Home() {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="flex w-full flex-col">
                <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                    <Alert variant="default">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Loading...</AlertTitle>
                        <AlertDescription>
                            We are currently trying to fetch your data from your local storage.
                        </AlertDescription>
                    </Alert>
                </main>
            </div>
        );
    }

    return (
        <div>
            <Dashboard />
            {process.env.NODE_ENV === "development" && (
                <>
                    <h1>User Data</h1>
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                </>
            )}
        </div>
    );
}
