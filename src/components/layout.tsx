import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "./UserContext";
import { SignUp } from "./sign-up";
import { useEffect } from "react";
import { loadData } from "@/utils/load";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, setUser } = useUser();

    useEffect(() => {
        const data = loadData();
        if (data) {
            setUser(data);
        }
    }, []);

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
