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

  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/2727ac65-d4c4-4377-a3ee-e2be505a8a5e", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "route.ts:14",
      message: "sending to Claude",
      data: {
        hasSystemPrompt: !!ragSystemPrompt,
        systemPromptLength: ragSystemPrompt?.length || 0,
        lastUserMsg: messages[messages.length - 1]?.content?.substring(0, 100),
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "C",
    }),
  }).catch(() => {});
  // #endregion

  const result = streamText({
    model: anthropic(model),
    messages,
    maxSteps: 5,
    tools: buildWebTools(),
    system: ragSystemPrompt || undefined,
  });

  return result.toDataStreamResponse();
}
