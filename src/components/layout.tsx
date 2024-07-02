import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";

import { ThemeProvider } from "@/components/theme-provider";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Navbar />
                <main>{children}</main>
                <Toaster />
            </ThemeProvider>
        </>
    );
};

export default Layout;
