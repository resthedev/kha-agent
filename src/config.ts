// Configuration - replace with your actual API key
export const config = {
    anthropic: {
        apiKey: "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", // Replace with your actual Anthropic API key
        model: "claude-haiku-4-5-20251001",
        maxTokens: 1024,
    },
};

// Export individual values for convenience
export const apiKey = config.anthropic.apiKey;
export const model = config.anthropic.model;
export const maxTokens = config.anthropic.maxTokens;