/**
 * Format retrieved context into system prompts
 */

import path from "path";
import { retrieveRelevantChunks } from "./retrieve";
import { RetrievalResult } from "./types";

/**
 * Format a single retrieval result with citation
 */
function formatChunk(result: RetrievalResult, index: number): string {
  const fileName = path.basename(result.chunk.filePath, ".md");
  const headingPath =
    result.chunk.metadata.headings.length > 0
      ? ` > ${result.chunk.metadata.headings.join(" > ")}`
      : "";

  return `[${index + 1}] From "${fileName}"${headingPath}:\n${result.chunk.text}`;
}

/**
 * Build RAG system prompt from query
 * Returns empty string if no relevant context found
 */
export async function buildRagSystemPrompt(query: string): Promise<string> {
  try {
    const results = await retrieveRelevantChunks(query);

    if (results.length === 0) {
      // #region agent log
      fetch("http://127.0.0.1:7243/ingest/2727ac65-d4c4-4377-a3ee-e2be505a8a5e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "ragPrompt.ts:23",
          message: "NO RESULTS - returning empty",
          data: { query },
          timestamp: Date.now(),
          sessionId: "debug-session",
          hypothesisId: "A",
        }),
      }).catch(() => {});
      // #endregion
      return "";
    }

    const contextBlocks = results.map((result, idx) => formatChunk(result, idx));

    const systemPrompt = `You have access to the following verified information. Use it to provide accurate, helpful responses:

${contextBlocks.join("\n\n---\n\n")}

Answer questions directly and concisely in a friendly, conversational tone. Use the information provided above when relevant. If you don't have enough information to fully answer a question, let the user know what you do know and what you're missing.`;
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/2727ac65-d4c4-4377-a3ee-e2be505a8a5e", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "ragPrompt.ts:42",
        message: "system prompt built",
        data: {
          query,
          numChunks: results.length,
          promptLength: systemPrompt.length,
          chunkHeadings: results.map((r) => r.chunk.metadata.headings),
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "B,C",
      }),
    }).catch(() => {});
    // #endregion
    return systemPrompt;
  } catch (error) {
    console.error("Error building RAG context:", error);
    return "";
  }
}

/**
 * Extract the latest user message from a conversation
 */
export function extractLatestUserMessage(messages: any[]): string {
  // Find the last user message
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      const content = messages[i].content;

      // Handle string content
      if (typeof content === "string") {
        return content;
      }

      // Handle array content (parts)
      if (Array.isArray(content)) {
        // Find text content in parts
        const textParts = content
          .filter((part: any) => typeof part === "string" || part.type === "text")
          .map((part: any) => (typeof part === "string" ? part : part.text))
          .filter(Boolean);

        if (textParts.length > 0) {
          return textParts.join(" ");
        }
      }
    }
  }

  return "";
}

/**
 * Build RAG system prompt from message history
 */
export async function buildRagSystemPromptFromMessages(messages: any[]): Promise<string> {
  const latestUserMessage = extractLatestUserMessage(messages);

  if (!latestUserMessage) {
    return "";
  }

  return buildRagSystemPrompt(latestUserMessage);
}
