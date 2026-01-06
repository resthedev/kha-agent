/**
 * Knowledge base index management
 * Handles loading, building, and caching the vector index
 */

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { KnowledgeBaseIndex, Chunk } from "./types";
import { getRagConfig } from "./config";
import { chunkMarkdown } from "./chunkMarkdown";
import { embedTexts } from "./openaiEmbeddings";

/**
 * Compute MD5 hash of file content for change detection
 */
async function hashFile(filePath: string): Promise<string> {
    try {
        const content = await fs.readFile(filePath, "utf-8");
        return crypto.createHash("md5").update(content).digest("hex");
    } catch (error) {
        return "";
    }
}

/**
 * Discover all markdown files in the knowledge base directory
 */
async function discoverMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                // Recursively search subdirectories
                const subFiles = await discoverMarkdownFiles(fullPath);
                files.push(...subFiles);
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Directory doesn't exist or can't be read
        console.warn(`Warning: Could not read knowledge base directory: ${dir}`);
    }
    
    return files;
}

/**
 * Load existing index from cache
 */
async function loadCachedIndex(cacheFilePath: string): Promise<KnowledgeBaseIndex | null> {
    try {
        const content = await fs.readFile(cacheFilePath, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

/**
 * Save index to cache
 */
async function saveCachedIndex(cacheFilePath: string, index: KnowledgeBaseIndex): Promise<void> {
    // Ensure cache directory exists
    const cacheDir = path.dirname(cacheFilePath);
    await fs.mkdir(cacheDir, { recursive: true });
    
    await fs.writeFile(cacheFilePath, JSON.stringify(index, null, 2), "utf-8");
}

/**
 * Build or update the knowledge base index
 * Only re-indexes files that have changed
 */
export async function buildOrUpdateIndex(forceRebuild = false): Promise<KnowledgeBaseIndex> {
    const config = getRagConfig();
    const { cacheFilePath, knowledgeBaseDir, embeddingModel } = config;

    // Load existing index if available
    const existingIndex = forceRebuild ? null : await loadCachedIndex(cacheFilePath);
    
    // Discover all markdown files
    const markdownFiles = await discoverMarkdownFiles(knowledgeBaseDir);
    
    if (markdownFiles.length === 0) {
        console.warn("Warning: No markdown files found in knowledge base directory");
        return {
            chunks: [],
            fileHashes: {},
            lastBuilt: Date.now(),
            embeddingModel,
        };
    }

    // Compute hashes for all files
    const currentHashes: Record<string, string> = {};
    for (const filePath of markdownFiles) {
        currentHashes[filePath] = await hashFile(filePath);
    }

    // Determine which files need reprocessing
    const filesToProcess: string[] = [];
    const unchangedChunks: Chunk[] = [];

    if (existingIndex && existingIndex.embeddingModel === embeddingModel) {
        // Keep chunks from unchanged files
        for (const chunk of existingIndex.chunks) {
            const fileStillExists = markdownFiles.includes(chunk.filePath);
            const hashUnchanged = 
                fileStillExists && 
                currentHashes[chunk.filePath] === existingIndex.fileHashes[chunk.filePath];
            
            if (hashUnchanged) {
                unchangedChunks.push(chunk);
            }
        }

        // Find files that need processing
        for (const filePath of markdownFiles) {
            const isNew = !existingIndex.fileHashes[filePath];
            const hasChanged = 
                existingIndex.fileHashes[filePath] !== currentHashes[filePath];
            
            if (isNew || hasChanged) {
                filesToProcess.push(filePath);
            }
        }
    } else {
        // Full rebuild needed
        filesToProcess.push(...markdownFiles);
    }

    console.log(`Processing ${filesToProcess.length} file(s), keeping ${unchangedChunks.length} unchanged chunk(s)`);

    // Process new/changed files
    const newChunks: Chunk[] = [];
    
    for (const filePath of filesToProcess) {
        try {
            const content = await fs.readFile(filePath, "utf-8");
            const chunksData = chunkMarkdown({ filePath, content });
            
            // Generate embeddings for all chunks from this file
            const texts = chunksData.map(c => c.text);
            const embeddings = await embedTexts(texts, embeddingModel);
            
            // Combine chunk data with embeddings
            for (let i = 0; i < chunksData.length; i++) {
                newChunks.push({
                    ...chunksData[i],
                    filePath,
                    embedding: embeddings[i],
                });
            }
            
            console.log(`Indexed ${chunksData.length} chunk(s) from ${path.basename(filePath)}`);
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    }

    // Combine unchanged and new chunks
    const allChunks = [...unchangedChunks, ...newChunks];

    const index: KnowledgeBaseIndex = {
        chunks: allChunks,
        fileHashes: currentHashes,
        lastBuilt: Date.now(),
        embeddingModel,
    };

    // Save to cache
    await saveCachedIndex(cacheFilePath, index);
    console.log(`Knowledge base index saved to ${cacheFilePath}`);

    return index;
}

/**
 * Get the current index, building it if necessary
 */
export async function getIndex(): Promise<KnowledgeBaseIndex> {
    const config = getRagConfig();
    const { cacheFilePath } = config;

    // Try to load cached index
    const cached = await loadCachedIndex(cacheFilePath);
    
    if (cached) {
        // Check if any files have changed
        const markdownFiles = await discoverMarkdownFiles(config.knowledgeBaseDir);
        const needsUpdate = await checkIfUpdateNeeded(cached, markdownFiles);
        
        if (!needsUpdate) {
            return cached;
        }
    }

    // Build or update index
    return buildOrUpdateIndex();
}

/**
 * Check if index needs updating
 */
async function checkIfUpdateNeeded(
    index: KnowledgeBaseIndex,
    currentFiles: string[]
): Promise<boolean> {
    // Check if file count changed
    const indexedFiles = Object.keys(index.fileHashes);
    if (indexedFiles.length !== currentFiles.length) {
        return true;
    }

    // Check if any files have changed
    for (const filePath of currentFiles) {
        const currentHash = await hashFile(filePath);
        if (index.fileHashes[filePath] !== currentHash) {
            return true;
        }
    }

    return false;
}

