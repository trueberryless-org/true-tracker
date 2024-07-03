import { useEffect, useState } from "react";
import { User } from "@/models";
import { useRouter } from "next/router";
import { loadData } from "@/utils/load";
import { saveData } from "@/utils/save";

import Link from "next/link";
import Image from "next/image";
import { CircleUser, Menu, Timer, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ModeToggle from "./mode-switch";
import { useUser } from "./UserContext";

export default function Navbar() {
    const { user, setUser } = useUser();
    const router = useRouter();

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
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold md:text-base"
                >
                    <Timer className="h-6 w-6" />
                    <span className="sr-only">True Tracker</span>
                </Link>
                <Link
                    href="/"
                    className={`${
                        router.pathname === "/" ? "text-foreground" : "text-muted-foreground"
                    } transition-colors hover:text-foreground`}
                >
                    Dashboard
                </Link>
                <Link
                    href="/projects"
                    className={`${
                        router.pathname.includes("projects")
                            ? "text-foreground"
                            : "text-muted-foreground"
                    } transition-colors hover:text-foreground`}
                >
                    Projects
                </Link>
                <Link
                    href="/settings"
                    className={`${
                        router.pathname.includes("settings")
                            ? "text-foreground"
                            : "text-muted-foreground"
                    } transition-colors hover:text-foreground`}
                >
                    Settings
                </Link>
            </nav>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-lg font-semibold md:text-base"
                        >
                            <Timer className="h-6 w-6" />
                            <span className="sr-only">True Tracker</span>
                        </Link>
                        <Link
                            href="/"
                            className={`${
                                router.pathname === "/"
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            } transition-colors hover:text-foreground`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/projects"
                            className={`${
                                router.pathname.includes("projects")
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            } transition-colors hover:text-foreground`}
                        >
                            Projects
                        </Link>
                        <Link
                            href="/settings"
                            className={`${
                                router.pathname.includes("settings")
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            } transition-colors hover:text-foreground`}
                        >
                            Settings
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                {/* <form className="ml-auto flex-1 sm:flex-initial">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        />
                    </div>
                </form> */}
                <div className="ml-auto flex-1 sm:flex-initial">
                    <ModeToggle />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-4 bg-secondary rounded-full ps-4">
                        <h5>{user.username}</h5>
                        <Button size="icon" className="rounded-full relative">
                            {user.profilePicture ? (
                                <Image
                                    src={user.profilePicture}
                                    alt="Profile picture"
                                    className="rounded-full"
                                    layout="fill"
                                    objectFit="cover"
                                    sizes="256px"
                                />
                            ) : (
                                <CircleUser className="h-5 w-5" />
                            )}
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* <DropdownMenuLabel>{user.username}</DropdownMenuLabel> */}
                        <DropdownMenuItem>
                            <Link href={"/settings"}>Settings</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
