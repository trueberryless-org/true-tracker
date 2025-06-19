import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { useEffect } from "react";

import { loadUserAndUpdateVersion } from "@/utils/userUtils";

import { UserProvider, useUser } from "@/components/UserContext";
import Layout from "@/components/layout";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

interface MyAppProps {
  Component: React.ElementType;
  pageProps: any;
}

function MyApp({ Component, pageProps }: MyAppProps) {
  const { setUser } = useUser();

  useEffect(() => {
    loadUserAndUpdateVersion(setUser);
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
