import { useRef } from "react";

interface Message {
    id: string;
    parts?: Array<{
        type: string;
        toolInvocation?: {
            toolCallId: string;
            result?: unknown;
        };
    }>;
}

export function useAnimationTracking(_messages: Message[]) {
    const animatedMessageIds = useRef<Set<string>>(new Set());
    const animatedToolBubbles = useRef<Set<string>>(new Set());
    const animatedTextBubbles = useRef<Set<string>>(new Set());
    // These sets are updated synchronously during render in ToolCallBubble
    // to track which tool results/checkmarks have already animated
    const animatedToolResults = useRef<Set<string>>(new Set());
    const animatedCheckmarks = useRef<Set<string>>(new Set());

    return {
        animatedMessageIds,
        animatedToolBubbles,
        animatedTextBubbles,
        animatedToolResults,
        animatedCheckmarks,
    };
}
