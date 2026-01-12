/**
 * Chunks markdown content into semantic segments
 * Uses heading-aware chunking to preserve context
 */

interface ChunkInput {
  filePath: string;
  content: string;
  maxChunkSize?: number;
}

interface ChunkOutput {
  id: string;
  text: string;
  metadata: {
    headings: string[];
    startChar: number;
    endChar: number;
  };
}

/**
 * Chunks markdown content preserving heading hierarchy
 * Default max chunk size: 1500 characters
 */
export function chunkMarkdown({
  filePath,
  content,
  maxChunkSize = 1500,
}: ChunkInput): ChunkOutput[] {
  const chunks: ChunkOutput[] = [];
  const lines = content.split("\n");

  let currentHeadings: string[] = [];
  let currentChunkLines: string[] = [];
  let currentChunkStart = 0;
  let currentCharPosition = 0;
  let chunkCounter = 0;

  const flushChunk = () => {
    if (currentChunkLines.length === 0) return;

    const text = currentChunkLines.join("\n").trim();
    if (text.length === 0) return;

    const endChar = currentCharPosition;
    chunks.push({
      id: `${filePath}#chunk-${chunkCounter}`,
      text,
      metadata: {
        headings: [...currentHeadings],
        startChar: currentChunkStart,
        endChar,
      },
    });

    chunkCounter++;
    currentChunkLines = [];
    currentChunkStart = currentCharPosition;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineWithNewline = line + (i < lines.length - 1 ? "\n" : "");

    // Check if this is a heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];

      // If we have a chunk and this is a high-level heading, flush it
      if (currentChunkLines.length > 0 && level <= 2) {
        flushChunk();
      }

      // Update heading hierarchy
      currentHeadings = currentHeadings.slice(0, level - 1);
      currentHeadings[level - 1] = headingText;

      currentChunkLines.push(line);
    } else {
      currentChunkLines.push(line);
    }

    currentCharPosition += lineWithNewline.length;

    // Check if current chunk exceeds max size
    const currentSize = currentChunkLines.join("\n").length;
    if (currentSize >= maxChunkSize) {
      flushChunk();
    }
  }

  // Flush remaining content
  flushChunk();

  return chunks;
}
