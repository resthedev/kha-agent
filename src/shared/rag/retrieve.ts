/**
 * Vector retrieval using cosine similarity
 */

import { Chunk, RetrievalResult } from "./types";
import { getRagConfig } from "./config";
import { embedText } from "./openaiEmbeddings";
import { getIndex } from "./kbIndex";

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (normA * normB);
}

/**
 * Retrieve top-K most relevant chunks for a query
 */
export async function retrieveRelevantChunks(query: string): Promise<RetrievalResult[]> {
    const config = getRagConfig();
    const { topK, minScore, embeddingModel } = config;

    // Get the current index
    const index = await getIndex();

    if (index.chunks.length === 0) {
        return [];
    }

    // Embed the query
    const queryEmbedding = await embedText(query, embeddingModel);

    // Compute similarity scores for all chunks
    const results: RetrievalResult[] = index.chunks.map(chunk => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Filter by minimum score and take top K
    return results
        .filter(result => result.score >= minScore)
        .slice(0, topK);
}

