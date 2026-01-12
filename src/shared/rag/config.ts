import path from "path";
import { RagConfig } from "./types";

/**
 * RAG system configuration with sensible defaults
 * All values can be overridden via environment variables
 */
export function getRagConfig(): RagConfig {
  const projectRoot = process.cwd();

  return {
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    topK: parseInt(process.env.RAG_TOP_K ?? "5", 10),
    minScore: parseFloat(process.env.RAG_MIN_SCORE ?? "0.25"),
    cacheFilePath:
      process.env.RAG_CACHE_PATH ??
      path.join(projectRoot, ".rag-cache", "knowledge-base.index.json"),
    knowledgeBaseDir: process.env.KNOWLEDGE_BASE_DIR ?? path.join(projectRoot, "knowledge-base"),
  };
}

/**
 * Validate that required environment variables are set
 */
export function validateRagEnvironment(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY environment variable is required for RAG embeddings. " +
        "Please set it in .env.local"
    );
  }
}
