/**
 * RAG system type definitions
 */

export interface Chunk {
  /** Unique identifier for this chunk (file-based) */
  id: string;
  /** Source markdown file path */
  filePath: string;
  /** The actual text content of the chunk */
  text: string;
  /** Embedding vector for this chunk */
  embedding: number[];
  /** Metadata about the chunk */
  metadata: {
    /** Heading hierarchy leading to this chunk */
    headings: string[];
    /** Character position in original file */
    startChar: number;
    endChar: number;
  };
}

export interface KnowledgeBaseIndex {
  /** All chunks from all files */
  chunks: Chunk[];
  /** File hashes for change detection */
  fileHashes: Record<string, string>;
  /** When this index was last built */
  lastBuilt: number;
  /** Embedding model used */
  embeddingModel: string;
}

export interface RetrievalResult {
  /** The matching chunk */
  chunk: Chunk;
  /** Cosine similarity score (0-1) */
  score: number;
}

export interface RagConfig {
  /** OpenAI embedding model to use */
  embeddingModel: string;
  /** Number of top results to retrieve */
  topK: number;
  /** Minimum similarity score threshold */
  minScore: number;
  /** Cache file location */
  cacheFilePath: string;
  /** Knowledge base directory */
  knowledgeBaseDir: string;
}
