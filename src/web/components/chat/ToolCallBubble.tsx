import React, { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Calculator, Check, Cloud, Loader2, Terminal } from "lucide-react";

interface ToolInvocation {
  type: "tool-invocation";
  toolInvocation: {
    toolCallId: string;
    toolName: string;
    args?: Record<string, unknown>;
    result?: unknown;
  };
}

interface ToolCallBubbleProps {
  toolInvocations: ToolInvocation[];
  hasIncompleteTools: boolean;
  hasToolBubbleAnimated: boolean;
  animatedToolResults: Set<string>;
  animatedCheckmarks: Set<string>;
  animatedToolBubbles: Set<string>;
  bubbleId: string;
}

const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
} as const;

const resultVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
} as const;

function toolInvocationsSignature(parts: ToolInvocation[]): string {
  // Make memoization resilient even when Vercel AI SDK recreates arrays/objects during streaming.
  // Keep it cheap-ish and stable for "unchanged" rows.
  return parts
    .filter((p) => p.type === "tool-invocation")
    .map((p) => {
      const inv = p.toolInvocation;
      const args = inv.args ? JSON.stringify(inv.args) : "";
      const res = "result" in inv ? JSON.stringify(inv.result) : "";
      return `${inv.toolCallId}|${inv.toolName}|${args}|${res}`;
    })
    .join("::");
}

function ToolCallBubbleInner({
  toolInvocations,
  hasIncompleteTools,
  hasToolBubbleAnimated,
  animatedToolResults,
  animatedCheckmarks,
  animatedToolBubbles,
  bubbleId,
}: ToolCallBubbleProps) {
  const shouldAnimate = !hasToolBubbleAnimated;

  // IMPORTANT: don't mutate tracking sets during render (can run multiple times in React 18 dev/concurrent).
  // Mark "already animated" only after commit.
  useEffect(() => {
    if (!animatedToolBubbles.has(bubbleId)) {
      animatedToolBubbles.add(bubbleId);
    }

    for (const part of toolInvocations) {
      if (part.type !== "tool-invocation") continue;
      const toolCallId = part.toolInvocation.toolCallId;
      const addResult = "result" in part.toolInvocation;
      if (!addResult) continue;
      if (!animatedToolResults.has(toolCallId)) animatedToolResults.add(toolCallId);
      if (!animatedCheckmarks.has(toolCallId)) animatedCheckmarks.add(toolCallId);
    }
  }, [toolInvocations, animatedToolResults, animatedCheckmarks, animatedToolBubbles, bubbleId]);

  return (
    <motion.div
      variants={bubbleVariants}
      initial={shouldAnimate ? "hidden" : false}
      animate="visible"
      layout={false}
      className="flex gap-4"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#7aa2f7] shadow-sm shadow-[#7aa2f7]/5">
        <Bot className="h-5 w-5 text-[#1a1b26]" />
      </div>

      <div className="flex max-w-[80%] flex-col">
        <div
          style={{
            contain: "layout style paint",
            transform: "translateZ(0)",
          }}
          className="overflow-hidden rounded-2xl border border-[#ffffff]/5 bg-gradient-to-br from-[#24283b]/80 to-[#1f2335]/80 px-6 pb-0 pt-0 text-[#c0caf5] shadow-[0_0_15px_-3px_rgba(0,0,0,0.05)] shadow-sm"
        >
          <div className="-mx-6 space-y-0">
            {toolInvocations
              .filter((part) => part.type === "tool-invocation")
              .map((part) => {
                const toolInvocation = part.toolInvocation;
                const toolCallId = toolInvocation.toolCallId;
                const addResult = "result" in toolInvocation;

                // Check if this result has already animated
                const hasResultAnimated = animatedToolResults.has(toolCallId);
                const hasCheckmarkAnimated = animatedCheckmarks.has(toolCallId);

                return (
                  <div key={toolCallId} className="text-sm">
                    <div className="flex items-center gap-3 rounded-none border-t border-[#ffffff]/5 bg-[#16161e]/50 p-3 px-6 backdrop-blur-md transition-all">
                      {toolInvocation.toolName === "weather" ? (
                        <Cloud className="h-4 w-4 text-[#7aa2f7] drop-shadow-[0_0_8px_rgba(122,162,247,0.15)]" />
                      ) : toolInvocation.toolName === "calculator" ? (
                        <Calculator className="h-4 w-4 text-[#bb9af7] drop-shadow-[0_0_8px_rgba(187,154,247,0.15)]" />
                      ) : (
                        <Terminal className="h-4 w-4 text-[#565f89]" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[#7dcfff] transition-colors">
                          {toolInvocation.toolName}
                        </div>
                        {"args" in toolInvocation && (
                          <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-xs text-[#565f89]">
                            {Object.entries(toolInvocation.args || {}).map(([key, value], idx) => (
                              <span
                                key={`${toolCallId}-arg-${key || idx}`}
                                className="inline-flex items-center gap-1"
                              >
                                <span className="text-[#7aa2f7]/60">{key}:</span>
                                <span className="text-[#9aa5ce]">{`"${String(value)}"`}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {addResult ? (
                        <div className="relative h-4 w-4 flex-shrink-0">
                          <Check
                            className={`h-4 w-4 text-[#9ece6a] ${!hasCheckmarkAnimated ? "checkmark-icon" : ""}`}
                            strokeWidth={3}
                          />
                        </div>
                      ) : (
                        <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-[#7aa2f7]" />
                      )}
                    </div>
                    {addResult && (
                      <motion.div
                        variants={resultVariants}
                        initial={hasResultAnimated ? false : "hidden"}
                        animate="visible"
                        transition={hasResultAnimated ? { duration: 0 } : undefined}
                        className="flex items-center px-6 py-3 font-mono text-xs text-[#9aa5ce]"
                      >
                        <span className="mr-2 opacity-50">→</span>
                        {JSON.stringify(toolInvocation.result)}
                      </motion.div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const ToolCallBubble = memo(ToolCallBubbleInner, (prev, next) => {
  if (prev.hasIncompleteTools !== next.hasIncompleteTools) return false;
  if (prev.hasToolBubbleAnimated !== next.hasToolBubbleAnimated) return false;
  // Sets are stable refs; don't use them for equality.
  return (
    toolInvocationsSignature(prev.toolInvocations) ===
    toolInvocationsSignature(next.toolInvocations)
  );
});
