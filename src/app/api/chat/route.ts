import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { buildWebTools } from "@/shared/agent/webTools";
import { model } from "@/shared/config";
import { buildRagSystemPromptFromMessages } from "@/shared/rag";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Build RAG context from the latest user message
    const ragSystemPrompt = await buildRagSystemPromptFromMessages(messages);

    const result = streamText({
        model: anthropic(model),
        messages,
        maxSteps: 5,
        tools: buildWebTools(),
        system: ragSystemPrompt || undefined,
    });

    return result.toDataStreamResponse();
}
