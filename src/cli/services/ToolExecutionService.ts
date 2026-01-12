import Anthropic from "@anthropic-ai/sdk";
import { getToolByName } from "../../shared/tools";
import { ToolInvocation } from "../../shared/types";

export class ToolExecutionService {
  /**
   * Execute all tool use requests from Claude's response
   */
  async executeToolCalls(toolUseBlocks: Anthropic.ToolUseBlock[]): Promise<{
    results: Anthropic.ToolResultBlockParam[];
    invocations: ToolInvocation[];
  }> {
    const results: Anthropic.ToolResultBlockParam[] = [];
    const invocations: ToolInvocation[] = [];

    for (const block of toolUseBlocks) {
      try {
        const tool = getToolByName(block.name);

        if (!tool) {
          throw new Error(`Unknown tool: ${block.name}`);
        }

        const result = await tool.execute(block.input);

        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: String(result),
        });

        invocations.push({
          toolCallId: block.id,
          toolName: block.name,
          args: block.input as Record<string, unknown>,
          result,
          state: "result",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `Error: ${errorMessage}`,
          is_error: true,
        });

        invocations.push({
          toolCallId: block.id,
          toolName: block.name,
          args: block.input as Record<string, unknown>,
          result: errorMessage,
          state: "error",
        });
      }
    }

    return { results, invocations };
  }

  /**
   * Extract tool use blocks from Claude's response
   */
  extractToolUseBlocks(content: Anthropic.ContentBlock[]): Anthropic.ToolUseBlock[] {
    return content.filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
  }

  /**
   * Extract text blocks from Claude's response
   */
  extractTextBlocks(content: Anthropic.ContentBlock[]): Anthropic.TextBlock[] {
    return content.filter((block): block is Anthropic.TextBlock => block.type === "text");
  }
}
