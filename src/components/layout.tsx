import { useEffect } from "react";

import { loadData } from "@/utils/load";

import Navbar from "@/components/navbar";

import { Toaster } from "@/components/ui/toaster";

import { useUser } from "./UserContext";
import { SignUp } from "./sign-up";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user } = useUser();

    if (!user) {
        return <SignUp />;
    }

    return (
        <>
            <Navbar />
            <main>{children}</main>
        </>
    );
};

export default Layout;
