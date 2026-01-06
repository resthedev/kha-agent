/**
 * Format retrieved context into system prompts
 */

import path from "path";
import { RetrievalResult } from "./types";
import { retrieveRelevantChunks } from "./retrieve";

/**
 * Format a single retrieval result with citation
 */
function formatChunk(result: RetrievalResult, index: number): string {
    const fileName = path.basename(result.chunk.filePath, ".md");
    const headingPath = result.chunk.metadata.headings.length > 0
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
            return "";
        }

        const contextBlocks = results.map((result, idx) => formatChunk(result, idx));

        return `You have access to the following information from the knowledge base. Use this information to ground your responses when relevant:

${contextBlocks.join("\n\n---\n\n")}

When answering questions, prioritize information from the knowledge base above. If the knowledge base contains relevant information, cite it. If the knowledge base doesn't contain information needed to answer the question, clearly state that the information is not in your knowledge base.`;
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
                    .map((part: any) => typeof part === "string" ? part : part.text)
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

