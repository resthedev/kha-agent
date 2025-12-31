import { Tool } from "../types";

export const weatherTool: Tool = {
    name: "weather",
    description: "Get the current weather for a specific location",

    execute: async (args: { location: string }) => {
        const response = await fetch(
            `https://wttr.in/${encodeURIComponent(args.location)}?format=j1`
        );
        const data = (await response.json()) as { current_condition: { weatherDesc: { value: string }[]; temp_F: number }[] };
        const current = data.current_condition[0];
        return `${current?.weatherDesc[0]?.value}, ${current?.temp_F}°F`;
    },

    schema: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "The city and state, e.g. San Francisco, CA",
            },
        },
        required: ["location"],
    },
};