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
import { getCurrentTheme, setTheme } from "@/utils/themes";

export default function ThemeSwitcher() {
    const { user } = useUser();
    const [currentTheme, setCurrentTheme] = React.useState("default");

    // Load and set the initial theme on mount
    React.useEffect(() => {
        const initialTheme = user?.settings.theme || getCurrentTheme();
        setTheme(initialTheme);
        setCurrentTheme(initialTheme);
    }, [user]);

    const handleThemeChange = React.useCallback(
        (theme: any) => {
            setTheme(theme);
            setCurrentTheme(theme);

            if (user) {
                user.settings.theme = theme;
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
                <DropdownMenuItem onClick={() => handleThemeChange("amethyst")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Amethyst"} color={"amethyst"} />
                        <div>Amethyst</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("sapphire")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Sapphire"} color={"sapphire"} />
                        <div>Sapphire</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("emerald")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Emerald"} color={"emerald"} />
                        <div>Emerald</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("ruby")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Ruby"} color={"ruby"} />
                        <div>Ruby</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("coral")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Coral"} color={"coral"} />
                        <div>Coral</div>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("amber")} className="group">
                    <div className="flex items-center space-x-2">
                        <ThemeDiamond title={"Amber"} color={"amber"} />
                        <div>Amber</div>
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
