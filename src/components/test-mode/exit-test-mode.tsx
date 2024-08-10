import { Minus, Plus, ShieldAlert } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

import { clearLocalStorage } from "@/utils/localStorage";

import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import { useUser } from "../UserContext";

const generateRandomData = () => {
    return Array.from({ length: 13 }, () => ({
        value: Math.floor(Math.random() * 400) + 100,
    }));
};

export function ExitTestMode() {
    const { setUser } = useUser();
    const [data, setData] = React.useState(generateRandomData);

    const clearAllUserData = () => {
        clearLocalStorage();
        setUser(null);
        toast("Successfully exited test mode.");
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="destructive" className="fixed bottom-4 left-4" size={"icon"}>
                    <ShieldAlert className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Exit Test Mode</DrawerTitle>
                        <DrawerDescription>
                            You&apos;re in currently experienting the entire application with a test user. We recommend
                            exiting this test user and creating a new user or import existing data from a previous user
                            in the Sign Up menu.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <div className="mt-3 h-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <Bar
                                        dataKey="value"
                                        style={
                                            {
                                                fill: "hsl(var(--foreground))",
                                                opacity: 0.9,
                                            } as React.CSSProperties
                                        }
                                        animationDuration={2269}
                                        animationEasing="ease-out"
                                        radius={4}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <DrawerFooter>
                        <Button onClick={clearAllUserData}>Go back to Sign Up</Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
