import "../styles/globals.css";
import { Inter } from "next/font/google";
import Layout from "../components/layout";

const inter = Inter({ subsets: ["latin"] });

function MyApp({ Component, pageProps }) {
    return (
        <div className={inter.className}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </div>
    );
}

export default MyApp;
