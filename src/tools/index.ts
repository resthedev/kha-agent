import { Tool } from "../types";
import { calculatorTool } from "./calculator";
import { weatherTool } from "./weather";

export const tools: Tool[] = [
    calculatorTool,
    weatherTool,
];

// Helper to get tool by name
export function getToolByName(name: string): Tool | undefined {
    return tools.find(tool => tool.name === name);
}