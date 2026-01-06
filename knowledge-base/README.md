# Knowledge Base

This directory contains markdown files that feed into the agent's knowledge base through a RAG (Retrieval Augmented Generation) system.

## How it works

1. **Add markdown files** here (e.g., `kha.md`, `company-info.md`, etc.)
2. The system automatically **chunks** each file into semantic segments
3. **Embeddings** are generated using OpenAI's embedding API
4. When you ask the agent a question, it **retrieves** the most relevant chunks
5. The agent **grounds its answers** in the retrieved context

## Usage

### Adding new knowledge

Simply add or edit `.md` files in this directory. The system will:
- Automatically detect changes on next startup
- Incrementally update only changed files
- Keep a cached index for fast retrieval

### Forcing a rebuild

If you want to manually rebuild the index:

```bash
bun run rag:index
```

## Tips

- Use clear headings to help the chunking algorithm
- Keep information organized within sections
- The agent will cite which file it's pulling information from
- If information isn't in the knowledge base, the agent will indicate it doesn't know

