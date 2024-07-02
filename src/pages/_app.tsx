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

const inter = Inter({ subsets: ["latin"] });

interface MyAppProps {
    Component: React.ElementType;
    pageProps: any;
}

export default function MyApp({ Component, pageProps }: MyAppProps) {
    const { user, setUser } = useUser();

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
