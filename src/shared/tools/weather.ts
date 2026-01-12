import { z } from "zod";
import { Tool } from "../types";

// Define the Zod schema - single source of truth
const weatherSchema = z.object({
  location: z.string().describe("The city and state, e.g. San Francisco, California, USA"),
});

// TypeScript type automatically inferred from schema
export type WeatherArgs = z.infer<typeof weatherSchema>;

export const weatherTool: Tool<typeof weatherSchema> = {
  name: "weather",
  description: "Get the current weather for a specific location",
  schema: weatherSchema,

  // Args are now properly typed as WeatherArgs automatically!
  execute: async (args) => {
    // Normalize location to help wttr.in geocode correctly
    // Replace ", CA" with ", California, USA" to avoid confusion with Canada
    const normalizedLocation = args.location
      .replace(/, CA$/i, ", California, USA")
      .replace(/, NY$/i, ", New York, USA")
      .replace(/, TX$/i, ", Texas, USA")
      .replace(/, FL$/i, ", Florida, USA");

    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(normalizedLocation)}?format=j1`
    );
    const data = (await response.json()) as {
      current_condition: { weatherDesc: { value: string }[]; temp_F: number }[];
      nearest_area: { areaName: { value: string }[]; country: { value: string }[] }[];
    };
    const current = data.current_condition[0];
    const location = data.nearest_area[0];
    const locationName = `${location.areaName[0].value}, ${location.country[0].value}`;
    return `${current?.weatherDesc[0]?.value}, ${current?.temp_F}°F in ${locationName}`;
  },
};
