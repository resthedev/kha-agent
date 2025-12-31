import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
    weight: ["400", "500", "700"],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Agent Chat",
    description: "Web interface for your AI agent",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${dmSans.variable} font-sans antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
