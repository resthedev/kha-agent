import Anthropic from "@anthropic-ai/sdk";
import { tools } from "../tools";

/**
 * Converts a Zod type to JSON Schema format for Anthropic API
 */
function zodTypeToJsonSchema(zodType: any): any {
    const typeName = zodType._def?.typeName;

    switch (typeName) {
        case "ZodString":
            return {
                type: "string",
                description: zodType._def?.description
            };
        case "ZodNumber":
            return {
                type: "number",
                description: zodType._def?.description
            };
        case "ZodEnum":
            return {
                type: "string",
                enum: zodType._def?.values,
                description: zodType._def?.description
            };
        default:
            return { type: "string" };
    }
}

/**
 * Builds Anthropic Tool[] from our shared tool definitions
 * Converts Zod schemas to JSON Schema format that Anthropic SDK expects
 */
export function toAnthropicTools(): Anthropic.Tool[] {
    return tools.map((tool) => {
        // Convert Zod schema to JSON Schema format
        const zodSchema = tool.schema as any;
        const jsonSchema = zodSchema._def?.typeName === "ZodObject"
            ? {
                type: "object" as const,
                properties: Object.fromEntries(
                    Object.entries(zodSchema._def.shape()).map(([key, value]: [string, any]) => [
                        key,
                        zodTypeToJsonSchema(value)
                    ])
                ),
                required: Object.keys(zodSchema._def.shape())
            }
            : { type: "object" as const, properties: {} };

        return {
            name: tool.name,
            description: tool.description,
            input_schema: jsonSchema,
        };
    });
}

