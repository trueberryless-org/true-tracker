"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeDiamond } from "./theme-diamond";
import { useUser } from "../UserContext";
import { saveData } from "@/utils/save";

// Utility function to set the theme
function setTheme(theme: any) {
    const htmlElement = document.documentElement;
    const themes = ["default", "palette", "sapphire", "ruby", "emerald", "daylight", "midnight"];

    // Remove all theme classes
    themes.forEach((t) => htmlElement.classList.remove(t));

    // Add the new theme class if it's not 'gray'
    if (theme !== "default") {
        htmlElement.classList.add(theme);
    }
}

// Utility function to get the current theme
function getCurrentTheme() {
    const htmlElement = document.documentElement;
    const themes = ["default", "palette", "sapphire", "ruby", "emerald", "daylight", "midnight"];

    for (let theme of themes) {
        if (htmlElement.classList.contains(theme)) {
            return theme;
        }
    }
    return "default";
}

export default function ThemeSwitcher() {
    const { user } = useUser();
    const [currentTheme, setCurrentTheme] = React.useState("default");

    // Load and set the initial theme on mount
    React.useEffect(() => {
        const initialTheme = user?.theme || getCurrentTheme();
        setTheme(initialTheme);
        setCurrentTheme(initialTheme);
    }, [user]);

    const handleThemeChange = React.useCallback(
        (theme: any) => {
            setTheme(theme);
            setCurrentTheme(theme);

            if (user) {
                user.theme = theme;
                saveData(user);
            }
        },
        [user]
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <ThemeDiamond title={currentTheme} color={"current"} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleThemeChange("default")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Default"} color={"default"} />
                        <div>Default</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("palette")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Palette"} color={"palette"} />
                        <div>Palette</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("sapphire")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Sapphire"} color={"sapphire"} />
                        <div>Sapphire</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("ruby")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Ruby"} color={"ruby"} />
                        <div>Ruby</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("emerald")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Emerald"} color={"emerald"} />
                        <div>Emerald</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("daylight")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Daylight"} color={"daylight"} />
                        <div>Daylight</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("midnight")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Midnight"} color={"midnight"} />
                        <div>Midnight</div>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
