import Anthropic from "@anthropic-ai/sdk";
import { getToolByName } from "../shared/tools";
import { apiKey, model, maxTokens } from "../shared/config";
import { toAnthropicTools } from "../shared/agent/anthropicTools";

const anthropic = new Anthropic({ apiKey });

export class Agent {
    private conversationHistory: Anthropic.MessageParam[] = [];

    async chat(userMessage: string): Promise<void> {
        // Add user message to history
        this.conversationHistory.push({
            role: "user",
            content: userMessage,
        });

        // Get response from Claude (might include tool use) with streaming
        let response = await this.getClaudeResponseStreaming();

        // Handle tool use loop - Claude might use multiple tools
        while (response.stop_reason === "tool_use") {
            const toolResults = await this.executeTools(response);

            // Add tool results to history
            this.conversationHistory.push({
                role: "user",
                content: toolResults,
            });

            // Get Claude's next response with streaming
            response = await this.getClaudeResponseStreaming();
        }
    }

    private async getClaudeResponseStreaming(): Promise<Anthropic.Message> {
        const stream = await anthropic.messages.stream({
            model,
            max_tokens: maxTokens,
            messages: this.conversationHistory,
            tools: toAnthropicTools(),
        });

        let hasStartedText = false;

        // Handle streaming events
        stream.on('text', (text) => {
            if (!hasStartedText) {
                process.stdout.write("\nClaude: ");
                hasStartedText = true;
            }
            process.stdout.write(text);
        });

        stream.on('end', () => {
            if (hasStartedText) {
                process.stdout.write("\n");
            }
        });

        // Get the final message
        const finalMessage = await stream.finalMessage();

        // Add to history if it's a text response
        if (finalMessage.stop_reason === "end_turn") {
            this.conversationHistory.push({
                role: "assistant",
                content: finalMessage.content,
            });
        }

        return finalMessage;
    }

    private async executeTools(
        response: Anthropic.Message
    ): Promise<Anthropic.ToolResultBlockParam[]> {
        // Add Claude's tool use request to history
        this.conversationHistory.push({
            role: "assistant",
            content: response.content,
        });

        // Execute all tool use requests
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of response.content) {
            if (block.type === "tool_use") {
                console.log(`\n[Using ${block.name} tool...]`);

                try {
                    const tool = getToolByName(block.name);

                    if (!tool) {
                        throw new Error(`Unknown tool: ${block.name}`);
                    }

                    const result = await tool.execute(block.input);
                    console.log(`[Result: ${result}]`);

                    toolResults.push({
                        type: "tool_result",
                        tool_use_id: block.id,
                        content: String(result),
                    });
                } catch (error) {
                    console.error(`[Error executing ${block.name}:`, error);

                    toolResults.push({
                        type: "tool_result",
                        tool_use_id: block.id,
                        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                        is_error: true,
                    });
                }
            }
        }

        return toolResults;
    }

    // Optional: Reset conversation
    reset(): void {
        this.conversationHistory = [];
    }

    // Optional: Get conversation history (useful for debugging)
    getHistory(): Anthropic.MessageParam[] {
        return [...this.conversationHistory];
    }
}
