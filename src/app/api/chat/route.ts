import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";
import { calculatorTool } from "@/tools/calculator";
import { weatherTool } from "@/tools/weather";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: anthropic("claude-haiku-4-5-20251001"),
        messages,
        maxSteps: 5,
        tools: {
            calculator: tool({
                description: calculatorTool.description,
                parameters: z.object({
                    operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("The mathematical operation to perform"),
                    a: z.number().describe("The first number"),
                    b: z.number().describe("The second number"),
                }),
                execute: async (args) => {
                    // calculatorTool.execute expects { operation, a, b } which matches args
                    return calculatorTool.execute(args);
                },
            }),
            weather: tool({
                description: weatherTool.description,
                parameters: z.object({
                    location: z.string().describe("The city and state, e.g. San Francisco, CA"),
                }),
                execute: async (args) => {
                    return weatherTool.execute(args);
                },
            }),
        },
    });

    return result.toDataStreamResponse();
}
