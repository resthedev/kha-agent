import { Tool } from "../types";

export const weatherTool: Tool = {
    name: "weather",
    description: "Get the current weather for a specific location",

    execute: async (args: { location: string }) => {
        // Normalize location to help wttr.in geocode correctly
        // Replace ", CA" with ", California, USA" to avoid confusion with Canada
        const normalizedLocation = args.location
            .replace(/, CA$/i, ', California, USA')
            .replace(/, NY$/i, ', New York, USA')
            .replace(/, TX$/i, ', Texas, USA')
            .replace(/, FL$/i, ', Florida, USA');

        const response = await fetch(
            `https://wttr.in/${encodeURIComponent(normalizedLocation)}?format=j1`
        );
        const data = (await response.json()) as { current_condition: { weatherDesc: { value: string }[]; temp_F: number }[]; nearest_area: { areaName: { value: string }[]; country: { value: string }[] }[] };
        const current = data.current_condition[0];
        const location = data.nearest_area[0];
        const locationName = `${location.areaName[0].value}, ${location.country[0].value}`;
        return `${current?.weatherDesc[0]?.value}, ${current?.temp_F}°F in ${locationName}`;
    },

    schema: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "The city and state, e.g. San Francisco, California, USA",
            },
        },
        required: ["location"],
    },
};