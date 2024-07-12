import "../styles/globals.css";
import { Inter } from "next/font/google";
import Layout from "../components/layout";
import { useEffect, useMemo } from "react";
import { loadData } from "@/utils/load";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider, useUser } from "@/components/UserContext";
import { sameVersion } from "@/utils/versionUtils";
import version from "@/constants/version";
import { upgradeData } from "@/utils/upgradeUtils";
import { initializeUpgradeFunctions } from "@/utils/upgradeFunctions";
import { exportData } from "@/utils/export";
import { toast } from "sonner";
import { saveData } from "@/utils/save";

const inter = Inter({ subsets: ["latin"] });

interface MyAppProps {
    Component: React.ElementType;
    pageProps: any;
}

function MyApp({ Component, pageProps }: MyAppProps) {
    const { user, setUser } = useUser();

    useEffect(() => {
        var data = loadData();
        if (data) {
            if (!sameVersion(data.version, version)) {
                initializeUpgradeFunctions();
                exportData();
                if (!data.version) data.version = { major: 0, minor: 1, patch: 0 };
                data = upgradeData(data, version);
                toast("We migrate your data to the latest version.");
            }
            data.visits = [{ id: crypto.randomUUID(), time: new Date() }, ...data.visits];
            setUser(data);
            saveData(data);
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
