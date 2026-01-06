# Kha Agent

An intelligent AI agent powered by Claude with tool-calling capabilities and RAG (Retrieval Augmented Generation) knowledge base integration.

## Features

- 🤖 **Dual Interface**: Beautiful Next.js web UI and CLI interface
- 🛠️ **Tool Execution**: Calculator, weather, and extensible tool system
- 📚 **RAG Knowledge Base**: Ground responses in your own markdown files
- ⚡ **Streaming Responses**: Real-time streaming for fast interactions
- 🎨 **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS

## Prerequisites

- [Bun](https://bun.sh) (v1.2.11 or later)
- Anthropic API key (for Claude)
- OpenAI API key (for RAG embeddings)

## Installation

1. Clone the repository and install dependencies:

```bash
bun install
```

2. Create a `.env.local` file in the project root:

```bash
# Required: Anthropic API key for Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Required: OpenAI API key for RAG embeddings
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage

### Web Interface

Start the Next.js development server:

```bash
bun run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### CLI Interface

Start an interactive chat session in your terminal:

```bash
bun run chat
```

Type `exit` to end the conversation.

## Knowledge Base (RAG)

The agent can ground its responses in your own markdown files using RAG.

### Adding Knowledge

1. Create markdown files in the `knowledge-base/` directory:

```bash
knowledge-base/
  ├── kha.md          # Example: information about Kha
  ├── company.md      # Your company info
  └── products.md     # Product documentation
```

2. The agent automatically detects and indexes these files on startup

3. Ask questions and the agent will retrieve relevant context

### Manually Rebuilding the Index

If you want to force a rebuild of the knowledge base index:

```bash
bun run rag:index
```

Add `--force` to force a complete rebuild:

```bash
bun run rag:index --force
```

### RAG Configuration

You can customize RAG behavior with environment variables in `.env.local`:

```bash
# Optional: Change the embedding model (default: text-embedding-3-small)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Optional: Number of context chunks to retrieve (default: 5)
RAG_TOP_K=5

# Optional: Minimum similarity score threshold (default: 0.25)
RAG_MIN_SCORE=0.25

# Optional: Custom knowledge base directory (default: ./knowledge-base)
KNOWLEDGE_BASE_DIR=/path/to/your/knowledge-base

# Optional: Custom cache location (default: ./.rag-cache/knowledge-base.index.json)
RAG_CACHE_PATH=/path/to/cache.json
```

### How RAG Works

1. **Indexing**: Markdown files are chunked into semantic segments
2. **Embedding**: Each chunk is embedded using OpenAI's embedding API
3. **Caching**: Embeddings are cached locally for fast retrieval
4. **Retrieval**: When you ask a question, the most relevant chunks are retrieved
5. **Grounding**: The agent uses retrieved context to answer your question

The system incrementally updates the index when files change, so you don't need to rebuild everything every time.

## Adding Custom Tools

Tools are defined in `src/shared/tools/`. To add a new tool:

1. Create a new file in `src/shared/tools/` (e.g., `mytool.ts`)
2. Define your tool with a name, description, schema (using Zod), and execute function
3. Export it from `src/shared/tools/index.ts`

Example:

```typescript
import { z } from "zod";
import { Tool } from "../types";

export const myTool: Tool = {
    name: "my_tool",
    description: "Description of what the tool does",
    schema: z.object({
        param: z.string().describe("Parameter description"),
    }),
    execute: async ({ param }) => {
        // Your tool logic here
        return `Result: ${param}`;
    },
};
```

## Project Structure

```
kha-agent/
├── knowledge-base/          # Markdown files for RAG
├── src/
│   ├── app/                # Next.js app router
│   │   └── api/chat/       # API route for web chat
│   ├── cli/                # CLI interface
│   │   ├── agent.ts        # CLI agent implementation
│   │   ├── index.ts        # CLI entry point
│   │   └── rag-index.ts    # RAG indexing CLI
│   ├── shared/             # Shared code
│   │   ├── agent/          # Agent configuration
│   │   ├── rag/            # RAG system
│   │   │   ├── types.ts
│   │   │   ├── config.ts
│   │   │   ├── chunkMarkdown.ts
│   │   │   ├── openaiEmbeddings.ts
│   │   │   ├── kbIndex.ts
│   │   │   ├── retrieve.ts
│   │   │   └── ragPrompt.ts
│   │   └── tools/          # Tool definitions
│   └── web/                # Web UI components
└── .rag-cache/             # RAG index cache (gitignored)
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS, Framer Motion
- **AI**: Anthropic Claude, Vercel AI SDK
- **RAG**: OpenAI Embeddings API
- **Types**: TypeScript, Zod

## Development

Build for production:

```bash
bun run build
```

Start production server:

```bash
bun run start
```

## License

MIT
