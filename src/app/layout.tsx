import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
});

export const metadata: Metadata = {
    title: "Fides",
    description: "Sistema de Gerenciamento de Ata de Reunião",
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon.ico", sizes: "any" },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${montserrat.className} antialiased`}>
                <AuthProvider>{children}</AuthProvider>
                <Toaster position="top-right" />
            </body>
        </html>
    );
}
