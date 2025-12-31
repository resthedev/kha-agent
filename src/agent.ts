import Anthropic from "@anthropic-ai/sdk";
import { tools, getToolByName } from "./tools";
import { apiKey } from "./config";

const anthropic = new Anthropic({ apiKey });

export class Agent {
    private conversationHistory: Anthropic.MessageParam[] = [];

    async chat(userMessage: string): Promise<void> {
        // Add user message to history
        this.conversationHistory.push({
            role: "user",
            content: userMessage,
        });

        // Get response from Claude (might include tool use)
        let response = await this.getClaudeResponse();

        // Handle tool use loop - Claude might use multiple tools
        while (response.stop_reason === "tool_use") {
            const toolResults = await this.executeTools(response);

            // Add tool results to history
            this.conversationHistory.push({
                role: "user",
                content: toolResults,
            });

            // Get Claude's next response
            response = await this.getClaudeResponse();
        }

        // Display final text response
        this.displayResponse(response);
    }

    private async getClaudeResponse(): Promise<Anthropic.Message> {
        return await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            messages: this.conversationHistory,
            tools: this.getToolSchemas(),
        });
    }

    private getToolSchemas(): Anthropic.Tool[] {
        return tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.schema,
        }));
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

    private displayResponse(response: Anthropic.Message): void {
        const textBlock = response.content.find((block) => block.type === "text");

        if (textBlock && textBlock.type === "text") {
            console.log("\nClaude:", textBlock.text);

            // Add to history
            this.conversationHistory.push({
                role: "assistant",
                content: response.content,
            });
        }
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