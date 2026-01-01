import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const ppNeueMontreal = localFont({
    src: [
        {
            path: "./fonts/PPNeueMontreal-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/PPNeueMontreal-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/PPNeueMontreal-Bold.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    variable: "--font-pp-neue-montreal",
    display: 'swap',
});

const ppNeueMontrealMono = localFont({
    src: "./fonts/PPNeueMontrealMono-Regular.woff2",
    variable: "--font-pp-neue-montreal-mono",
    display: 'swap',
});

const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    variable: "--font-instrument-serif",
    weight: ["400"],
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
            <body className={`${ppNeueMontreal.variable} ${ppNeueMontrealMono.variable} ${instrumentSerif.variable} font-sans antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
