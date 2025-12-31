import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
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
            // Use Zod schemas directly from tool files - single source of truth!
            calculator: tool({
                description: calculatorTool.description,
                parameters: calculatorTool.schema,
                execute: calculatorTool.execute,
            }),
            weather: tool({
                description: weatherTool.description,
                parameters: weatherTool.schema,
                execute: weatherTool.execute,
            }),
        },
    });

    return result.toDataStreamResponse();
}
