import { z } from "zod";

export interface Tool<TSchema extends z.ZodType = z.ZodType> {
    name: string;
    description: string;
    schema: TSchema;
    execute: (args: z.infer<TSchema>) => Promise<any>;
}

export interface ToolInvocation {
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
    result: any;
    state: "result" | "error";
}