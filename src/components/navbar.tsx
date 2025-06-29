import { User } from "@/models";
import { CircleUser, Menu, Search, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { exportData } from "@/utils/export";
import { loadData } from "@/utils/load";
import { saveData } from "@/utils/save";

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

import { useUser } from "./UserContext";
import ModeToggle from "./themes/mode-switch";
import ThemeSwitcher from "./themes/theme-switcher";

export default function Navbar() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  const exportNow = () => {
    user.settings.lastExported = new Date();
    setUser(user);
    saveData(user);
    exportData();
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-10 z-50">
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
            router.pathname.includes("project")
              ? "text-foreground"
              : "text-muted-foreground"
          } transition-colors hover:text-foreground`}
        >
          Projects
        </Link>
        <Link
          href="/tasks"
          className={`${
            router.pathname.includes("task")
              ? "text-foreground"
              : "text-muted-foreground"
          } transition-colors hover:text-foreground`}
        >
          Tasks
        </Link>
        <Link
          href="/sessions"
          className={`${
            router.pathname === "/sessions"
              ? "text-foreground"
              : "text-muted-foreground"
          } transition-colors hover:text-foreground`}
          onClick={() =>
            setTimeout(() => {
              setIsSheetOpen(false);
            }, 200)
          }
        >
          Sessions
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
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
              onClick={() =>
                setTimeout(() => {
                  setIsSheetOpen(false);
                }, 200)
              }
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
              onClick={() =>
                setTimeout(() => {
                  setIsSheetOpen(false);
                }, 200)
              }
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className={`${
                router.pathname === "/projects"
                  ? "text-foreground"
                  : "text-muted-foreground"
              } transition-colors hover:text-foreground`}
              onClick={() =>
                setTimeout(() => {
                  setIsSheetOpen(false);
                }, 200)
              }
            >
              Projects
            </Link>
            <Link
              href="/tasks"
              className={`${
                router.pathname === "/tasks"
                  ? "text-foreground"
                  : "text-muted-foreground"
              } transition-colors hover:text-foreground`}
              onClick={() =>
                setTimeout(() => {
                  setIsSheetOpen(false);
                }, 200)
              }
            >
              Tasks
            </Link>
            <Link
              href="/sessions"
              className={`${
                router.pathname === "/sessions"
                  ? "text-foreground"
                  : "text-muted-foreground"
              } transition-colors hover:text-foreground`}
              onClick={() =>
                setTimeout(() => {
                  setIsSheetOpen(false);
                }, 200)
              }
            >
              Sessions
            </Link>
            <Link
              href="/settings"
              className={`${
                router.pathname === "/settings"
                  ? "text-foreground"
                  : "text-muted-foreground"
              } transition-colors hover:text-foreground`}
              onClick={() =>
                setTimeout(() => {
                  setIsSheetOpen(false);
                }, 200)
              }
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
        <div className="ml-auto flex-1 sm:flex-initial flex items-center gap-4">
          <ModeToggle />
          <ThemeSwitcher />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-4 bg-secondary rounded-full ps-4">
            <h5 className="truncate max-w-32 sm:max-w-96 md:max-w-56 lg:max-w-96 text-secondary-foreground">
              {user.username}
            </h5>
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
            <DropdownMenuItem onClick={exportNow}>Export data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
