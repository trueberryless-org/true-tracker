import "../styles/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

function MyApp({ Component, pageProps }) {
    return (
        <div className={inter.className}>
            <Component {...pageProps} />
        </div>
    );
}

export default MyApp;
