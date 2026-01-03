import { tool } from "ai";
import { tools } from "../tools";

/**
 * Builds the tools object for Vercel AI SDK's streamText
 * Converts our shared tool definitions into the format AI SDK expects
 */
export function buildWebTools() {
    const webTools: Record<string, any> = {};
    
    for (const t of tools) {
        webTools[t.name] = tool({
            description: t.description,
            parameters: t.schema,
            execute: t.execute,
        });
    }
    
    return webTools;
}

