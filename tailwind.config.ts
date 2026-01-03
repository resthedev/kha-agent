import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/web/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#1a1b26", // Tokyo Night background
                foreground: "#c0caf5", // Tokyo Night foreground
                primary: {
                    DEFAULT: "#7aa2f7", // Tokyo Night Blue
                    foreground: "#15161e",
                },
                secondary: {
                    DEFAULT: "#bb9af7", // Tokyo Night Purple
                    foreground: "#15161e",
                },
                muted: {
                    DEFAULT: "#24283b", // Tokyo Night lighter background
                    foreground: "#565f89", // Tokyo Night Comment
                },
                card: {
                    DEFAULT: "#1f2335", // Tokyo Night Dark Blue
                    foreground: "#c0caf5",
                }
            },
            fontFamily: {
                sans: ["var(--font-pp-neue-montreal)"],
                serif: ["var(--font-instrument-serif)"],
                mono: ["var(--font-pp-neue-montreal-mono)"],
            },
        },
    },
    plugins: [],
};
export default config;
