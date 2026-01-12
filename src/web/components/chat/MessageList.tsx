import { TextBubble } from "./TextBubble";
import { ToolCallBubble } from "./ToolCallBubble";

interface Message {
  id: string;
  role: "user" | "assistant" | "data" | "system";
  content?: string;
  parts?: Array<{
    type: string;
    text?: string;
    toolInvocation?: {
      toolCallId: string;
      toolName: string;
      args?: Record<string, unknown>;
      result?: unknown;
    };
  }>;
}

interface MessageListProps {
  messages: Message[];
  animatedMessageIds: React.MutableRefObject<Set<string>>;
  animatedToolBubbles: React.MutableRefObject<Set<string>>;
  animatedTextBubbles: React.MutableRefObject<Set<string>>;
  animatedToolResults: React.MutableRefObject<Set<string>>;
  animatedCheckmarks: React.MutableRefObject<Set<string>>;
}

export function MessageList({
  messages,
  animatedMessageIds,
  animatedToolBubbles,
  animatedTextBubbles,
  animatedToolResults,
  animatedCheckmarks,
}: MessageListProps) {
  return (
    <>
      {messages
        .filter((m) => (m.parts && m.parts.length > 0) || m.content)
        .map((m) => {
          const hasAnimated = animatedMessageIds.current.has(m.id);
          if (!hasAnimated) {
            animatedMessageIds.current.add(m.id);
          }

          // If message has parts, render them in order
          if (m.parts && m.parts.length > 0) {
            // Group consecutive parts of the same type
            const groupedParts: Array<{ type: "text" | "tool"; parts: any[]; index: number }> = [];
            let currentGroup: any = null;

            m.parts.forEach((part, index) => {
              if (part.type === "text") {
                if (currentGroup?.type === "text") {
                  currentGroup.parts.push(part);
                } else {
                  currentGroup = { type: "text", parts: [part], index };
                  groupedParts.push(currentGroup);
                }
              } else if (part.type === "tool-invocation") {
                if (currentGroup?.type === "tool") {
                  currentGroup.parts.push(part);
                } else {
                  currentGroup = { type: "tool", parts: [part], index };
                  groupedParts.push(currentGroup);
                }
              }
            });

            return (
              <div key={m.id} className="space-y-3">
                {groupedParts.map((group, groupIndex) => {
                  if (group.type === "text") {
                    const bubbleId = `${m.id}-text-${group.index}`;
                    const hasTextBubbleAnimated = animatedTextBubbles.current.has(bubbleId);

                    return (
                      <TextBubble
                        key={bubbleId}
                        role={m.role}
                        textParts={group.parts}
                        hasTextBubbleAnimated={hasTextBubbleAnimated}
                        bubbleId={bubbleId}
                        animatedTextBubbles={animatedTextBubbles.current}
                      />
                    );
                  } else {
                    const bubbleKey = `${m.id}-tools-${group.index}`;
                    const toolIds = group.parts
                      .map((p: any) => p.toolInvocation?.toolCallId)
                      .join("_");
                    // Use tool IDs for tracking to be resilient against message ID changes
                    const trackingId = toolIds || bubbleKey;
                    const hasToolBubbleAnimated = animatedToolBubbles.current.has(trackingId);

                    const hasIncompleteTools = group.parts.some((part: any) => {
                      return part.toolInvocation && !("result" in part.toolInvocation);
                    });

                    return (
                      <ToolCallBubble
                        key={bubbleKey}
                        toolInvocations={group.parts}
                        hasIncompleteTools={hasIncompleteTools}
                        hasToolBubbleAnimated={hasToolBubbleAnimated}
                        animatedToolResults={animatedToolResults.current}
                        animatedCheckmarks={animatedCheckmarks.current}
                        animatedToolBubbles={animatedToolBubbles.current}
                        bubbleId={trackingId}
                      />
                    );
                  }
                })}
              </div>
            );
          }

          // Fallback for messages with just content
          const textBubbleId = `${m.id}-text`;
          const hasTextBubbleAnimated = animatedTextBubbles.current.has(textBubbleId);

          return (
            <div key={m.id} className="space-y-3">
              <TextBubble
                role={m.role}
                textParts={[]}
                content={m.content}
                hasTextBubbleAnimated={hasTextBubbleAnimated}
                bubbleId={textBubbleId}
                animatedTextBubbles={animatedTextBubbles.current}
              />
            </div>
          );
        })}
    </>
  );
}
