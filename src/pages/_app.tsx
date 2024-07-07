import "../styles/globals.css";
import { Inter } from "next/font/google";
import Layout from "../components/layout";
import { useEffect, useState } from "react";
import { loadData } from "@/utils/load";
import { saveData } from "@/utils/save";
import { User } from "@/models";
import { SignUp } from "@/components/sign-up";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider, useUser } from "@/components/UserContext";
import { CHART_THEMES, getChartThemes } from "@/lib/chart-themes";

const inter = Inter({ subsets: ["latin"] });
const chartThemes = getChartThemes();

interface MyAppProps {
    Component: React.ElementType;
    pageProps: any;
}

export default function MyApp({ Component, pageProps }: MyAppProps) {
    const { user, setUser } = useUser();

    function generateCssVariables(themes: any) {
        let cssVariables = `:root {\n`;

        themes.forEach((theme: any) => {
            // Object.entries(theme.colors).forEach(([key, value]) => {
            //     const variableName = `--${key}`;
            //     cssVariables += `    ${variableName}: ${value};\n`;
            // });

            // Object.entries(theme.colorsDark).forEach(([key, value]) => {
            //     const variableName = `--${key}-dark`;
            //     cssVariables += `    ${variableName}: ${value};\n`;
            // });
            Object.entries(theme.colors).forEach(([key, value]) => {
                if (key.includes("chart")) {
                    const variableName = `--${key.replace(
                        "chart",
                        "color"
                    )}-${theme.name.toLowerCase()}`;
                    cssVariables += `    ${variableName}: hsl(${value});\n`;
                }
            });
            Object.entries(theme.colorsDark).forEach(([key, value]) => {
                if (key.includes("chart")) {
                    const variableName = `--${key.replace(
                        "chart",
                        "color"
                    )}-${theme.name.toLowerCase()}`;
                    cssVariables += `    ${variableName}-dark: hsl(${value});\n`;
                }
            });
        });

        cssVariables += `}`;

        return cssVariables;
    }

    const cssSelectors = generateCssVariables(CHART_THEMES);
    console.log(cssSelectors);

    useEffect(() => {
        const data = loadData();
        if (data) {
            setUser(data);
        }
    }, []);

    return (
        <div className={inter.className}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <UserProvider>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                    <Toaster />
                </UserProvider>
            </ThemeProvider>
        </div>
    );
}
