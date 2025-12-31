import { Tool } from "../types";

export const calculatorTool: Tool = {
    name: "calculator",
    description: "A simple calculator that can add, subtract, multiply, or divide two numbers",

    execute: async (args: { operation: string; a: number; b: number }) => {
        const { operation, a, b } = args;
        switch (operation) {
            case "add": return a + b;
            case "subtract": return a - b;
            case "multiply": return a * b;
            case "divide": return a / b;
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    },

    schema: {
        type: "object",
        properties: {
            operation: {
                type: "string",
                enum: ["add", "subtract", "multiply", "divide"],
                description: "The mathematical operation to perform",
            },
            a: { type: "number", description: "The first number" },
            b: { type: "number", description: "The second number" },
        },
        required: ["operation", "a", "b"],
    },
};