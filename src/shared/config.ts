// Configuration - API key should be set in .env.local as ANTHROPIC_API_KEY
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
if (!anthropicApiKey) {
  throw new Error("ANTHROPIC_API_KEY environment variable is not set. Please set it in .env.local");
}

export const config = {
  anthropic: {
    apiKey: anthropicApiKey,
    model: "claude-haiku-4-5-20251001",
    maxTokens: 1024,
  },
};

// Export individual values for convenience
export const apiKey = config.anthropic.apiKey;
export const model = config.anthropic.model;
export const maxTokens = config.anthropic.maxTokens;
