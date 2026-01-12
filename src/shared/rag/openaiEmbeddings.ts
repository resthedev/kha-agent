/**
 * OpenAI embeddings API integration
 */

export interface EmbeddingResponse {
  embeddings: number[][];
}

/**
 * Generate embeddings for an array of texts using OpenAI API
 */
export async function embedTexts(
  texts: string[],
  model = "text-embedding-3-small"
): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }

  // Handle empty input
  if (texts.length === 0) {
    return [];
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();

    // Extract embeddings in the same order as input
    return data.data.map((item: { embedding: number[] }) => item.embedding);
  } catch (error) {
    throw new Error(
      `Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate embedding for a single text
 */
export async function embedText(text: string, model = "text-embedding-3-small"): Promise<number[]> {
  const embeddings = await embedTexts([text], model);
  return embeddings[0];
}
