import { z } from "zod";
import { Tool } from "../types";

// Define the Zod schema - single source of truth
const calculatorSchema = z.object({
    operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("The mathematical operation to perform"),
    a: z.number().describe("The first number"),
    b: z.number().describe("The second number"),
});

// TypeScript type automatically inferred from schema
export type CalculatorArgs = z.infer<typeof calculatorSchema>;

export const calculatorTool: Tool<typeof calculatorSchema> = {
    name: "calculator",
    description: "A simple calculator that can add, subtract, multiply, or divide two numbers",
    schema: calculatorSchema,

    // Args are now properly typed as CalculatorArgs automatically!
    execute: async (args) => {
        const { operation, a, b } = args;
        switch (operation) {
            case "add": return a + b;
            case "subtract": return a - b;
            case "multiply": return a * b;
            case "divide": return a / b;
            default: throw new Error(`Unknown operation: ${operation}`);
        }
    },
};