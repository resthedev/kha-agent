import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { buildWebTools } from "@/shared/agent/webTools";
import { model } from "@/shared/config";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: anthropic(model),
        messages,
        maxSteps: 5,
        tools: buildWebTools(),
    });

    return result.toDataStreamResponse();
}
