import "../styles/globals.css";
import { Inter } from "next/font/google";
import Layout from "../components/layout";
import { useEffect, useMemo } from "react";
import { loadData } from "@/utils/load";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider, useUser } from "@/components/UserContext";
import { CHART_THEMES, getChartThemes } from "@/lib/chart-themes";

const inter = Inter({ subsets: ["latin"] });

interface MyAppProps {
    Component: React.ElementType;
    pageProps: any;
}

function MyApp({ Component, pageProps }: MyAppProps) {
    const { user, setUser } = useUser();

    useEffect(() => {
        const data = loadData();
        if (data) {
            setUser(data);
        }
    }, [setUser]);

    return (
        <div className={inter.className}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
                <Toaster />
            </ThemeProvider>
        </div>
    );
}

export default function AppWrapper(props: MyAppProps) {
    return (
        <UserProvider>
            <MyApp {...props} />
        </UserProvider>
    );
}
