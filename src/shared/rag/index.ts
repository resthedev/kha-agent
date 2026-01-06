/**
 * RAG system public API
 * Export the main functions needed by the agent
 */

export { buildRagSystemPrompt, buildRagSystemPromptFromMessages } from "./ragPrompt";
export { buildOrUpdateIndex, getIndex } from "./kbIndex";
export { validateRagEnvironment, getRagConfig } from "./config";
export type { RetrievalResult, KnowledgeBaseIndex, RagConfig } from "./types";

