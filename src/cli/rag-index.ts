#!/usr/bin/env bun

/**
 * Manual RAG index builder CLI
 * Force rebuilds the knowledge base index
 */

// Load environment variables from .env.local
import { readFileSync } from "fs";
import { join } from "path";

try {
    const envPath = join(process.cwd(), ".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2];
        }
    });
} catch (error) {
    // .env.local doesn't exist or couldn't be read
}

import { buildOrUpdateIndex, validateRagEnvironment, getRagConfig } from "../shared/rag";

async function main() {
    console.log("🔍 RAG Knowledge Base Indexer\n");

    try {
        // Validate environment
        validateRagEnvironment();

        const config = getRagConfig();
        console.log(`Knowledge base directory: ${config.knowledgeBaseDir}`);
        console.log(`Embedding model: ${config.embeddingModel}`);
        console.log(`Cache location: ${config.cacheFilePath}\n`);

        // Check if --force flag is present
        const forceRebuild = process.argv.includes("--force");

        if (forceRebuild) {
            console.log("🔄 Force rebuild requested\n");
        }

        // Build or update the index
        console.log("📚 Building knowledge base index...\n");
        const index = await buildOrUpdateIndex(forceRebuild);

        console.log("\n✅ Indexing complete!");
        console.log(`   Total chunks: ${index.chunks.length}`);
        console.log(`   Files indexed: ${Object.keys(index.fileHashes).length}`);
        console.log(`   Last built: ${new Date(index.lastBuilt).toLocaleString()}`);
    } catch (error) {
        console.error("\n❌ Error:", error instanceof Error ? error.message : "Unknown error");
        process.exit(1);
    }
}

main();

