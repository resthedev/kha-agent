import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is not set. Please set it in .env.local");
    process.exit(1);
}

const anthropic = new Anthropic({
    apiKey,
});

// Create an interface to read from terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const conversationHistory: Anthropic.MessageParam[] = [];

const tools: Anthropic.Tool[] = [
    {
        name: "calculator",
        description: "A simple calculator that can add, subtract, multiply, or divide two numbers",
        input_schema: {
            type: "object",
            properties: {
                operation: {
                    type: "string",
                    enum: ["add", "subtract", "multiply", "divide"],
                    description: "The mathematical operation to perform",
                },
                a: {
                    type: "number",
                    description: "The first number",
                },
                b: {
                    type: "number",
                    description: "The second number",
                },
            },
            required: ["operation", "a", "b"],
        },
    },
    {
        name: "weather",
        description: "Get the current weather for a specific location. Use this when the user asks about weather conditions.",
        input_schema: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The city and state, e.g. San Francisco, CA",
                },
            },
            required: ["location"],
        },
    },
];

function executeCalculator(operation: string, a: number, b: number): number {
    switch (operation) {
        case "add":
            return a + b;
        case "subtract":
            return a - b;
        case "multiply":
            return a * b;
        case "divide":
            return a / b;
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}

async function getWeather(location: string): Promise<string> {
    try {
        // wttr.in is a free weather API that doesn't require authentication
        const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
        const data = await response.json();

        const current = (data as { current_condition: { temp_F: number; weatherDesc: { value: string }[] }[] }).current_condition[0];
        const temp = current?.temp_F;
        const condition = current?.weatherDesc[0]?.value;

        return `${condition}, ${temp}°F`;
    } catch (error) {
        return `Could not fetch weather data for ${location}`;
    }
}

async function chat(userMessage: string) {
    conversationHistory.push({
        role: "user",
        content: userMessage,
    });

    const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: conversationHistory,
        tools: tools,
    });

    // Check if Claude wants to use a tool
    if (message.stop_reason === "tool_use") {
        // Find the tool_use block
        const toolUse = message.content.find((block) => block.type === "tool_use");

        if (toolUse && toolUse.type === "tool_use") {
            console.log(`\n[Claude wants to use ${toolUse.name}]`);

            // Execute the appropriate tool
            let result: string;

            if (toolUse.name === "calculator") {
                const calcResult = executeCalculator(
                    (toolUse.input as { operation: string; a: number; b: number }).operation,
                    (toolUse.input as { operation: string; a: number; b: number }).a,
                    (toolUse.input as { operation: string; a: number; b: number }).b
                );
                result = String(calcResult);
            } else if (toolUse.name === "weather") {
                result = await getWeather((toolUse.input as { location: string }).location);
            } else {
                result = "Unknown tool";
            }

            console.log(`[${toolUse.name} result: ${result}]`);

            // Add Claude's tool request to history
            conversationHistory.push({
                role: "assistant",
                content: message.content,
            });

            // Add the tool result to history
            conversationHistory.push({
                role: "user",
                content: [
                    {
                        type: "tool_result",
                        tool_use_id: toolUse.id,
                        content: String(result),
                    },
                ],
            });

            // Call Claude again with the tool result
            const finalResponse = await anthropic.messages.create({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 1024,
                messages: conversationHistory,
                tools: tools,
            });

            const textResponse = finalResponse.content.find((block) => block.type === "text");
            if (textResponse && textResponse.type === "text") {
                console.log("\nClaude:", textResponse.text);

                conversationHistory.push({
                    role: "assistant",
                    content: finalResponse.content,
                });
            }
        }
    } else {
        // Normal text response (no tool used)
        const response = message.content.find((block) => block.type === "text");
        if (response && response.type === "text") {
            console.log("\nClaude:", response.text);

            conversationHistory.push({
                role: "assistant",
                content: message.content,
            });
        }
    }
}

// Loop function to keep asking for input
function askQuestion() {
    rl.question("\nYou: ", async (userInput) => {
        if (userInput.toLowerCase() === "exit") {
            console.log("Goodbye!");
            rl.close();
            return;
        }

        await chat(userInput);
        askQuestion(); // Call itself again after getting response
    });
}

console.log("Chat with Claude! Type 'exit' to end the conversation.");
askQuestion();