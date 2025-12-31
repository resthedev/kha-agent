import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React, { memo, useEffect } from "react";

interface TextPart {
    type: 'text';
    text: string;
}

interface TextBubbleProps {
    role: 'user' | 'assistant' | 'data' | 'system';
    textParts: TextPart[];
    content?: string;
    hasTextBubbleAnimated: boolean;
    animatedTextBubbles: Set<string>;
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

function TextBubbleInner({ role, textParts, content, hasTextBubbleAnimated, animatedTextBubbles, bubbleId }: TextBubbleProps) {
    const shouldAnimate = !hasTextBubbleAnimated;

    useEffect(() => {
        if (!animatedTextBubbles.has(bubbleId)) {
            animatedTextBubbles.add(bubbleId);
        }
    }, [bubbleId, animatedTextBubbles]);

    return (
        <motion.div
            variants={bubbleVariants}
            initial={shouldAnimate ? "hidden" : false}
            animate="visible"
            layout={false}
            className={`flex gap-4 ${role === "user" ? "flex-row-reverse" : "flex-row"}`}
        >
            <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    role === "user" ? "bg-[#bb9af7] shadow-[#bb9af7]/5" : "bg-[#7aa2f7] shadow-[#7aa2f7]/5"
                }`}
            >
                {role === "user" ? (
                    <User className="w-5 h-5 text-[#1a1b26]" />
                ) : (
                    <Bot className="w-5 h-5 text-[#1a1b26]" />
                )}
            </div>

            <div
                className={`flex flex-col max-w-[80%] ${
                    role === "user" ? "items-end" : "items-start"
                }`}
            >
                <div
                    style={{
                        contain: "layout style paint",
                        transform: "translateZ(0)"
                    }}
                    className={`rounded-2xl px-6 py-4 shadow-sm overflow-hidden ${
                        role === "user"
                            ? "bg-gradient-to-br from-[#bb9af7]/10 to-[#bb9af7]/5 border border-[#bb9af7]/5 text-[#c0caf5] shadow-[0_0_15px_-3px_rgba(187,154,247,0.02)]"
                            : "bg-gradient-to-br from-[#24283b]/80 to-[#1f2335]/80 border border-[#ffffff]/5 text-[#c0caf5] shadow-[0_0_15px_-3px_rgba(0,0,0,0.05)]"
                    }`}
                >
                    {textParts.length > 0 ? (
                        textParts.filter(part => part.text).map((part, index) => (
                            <ReactMarkdown
                                key={`text-part-${index}`}
                                remarkPlugins={[remarkGfm]}
                                className="prose prose-invert prose-sm max-w-none leading-relaxed streaming-text [&>*:last-child]:mb-0 last:mb-0"
                            >
                                {part.text}
                            </ReactMarkdown>
                        ))
                    ) : (
                        content && (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                className="prose prose-invert prose-sm max-w-none leading-relaxed streaming-text [&>*:last-child]:mb-0"
                            >
                                {content}
                            </ReactMarkdown>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function textPartsSignature(textParts: TextPart[]): string {
    // Keep this stable across renders even if array identity changes.
    // Separator is important to avoid accidental concatenation collisions.
    return textParts.map((p) => p.text ?? "").join("\n");
}

export const TextBubble = memo(TextBubbleInner, (prev, next) => {
    if (prev.role !== next.role) return false;
    if (prev.hasTextBubbleAnimated !== next.hasTextBubbleAnimated) return false;

    // If we're using content fallback, compare only content.
    if (prev.content !== undefined || next.content !== undefined) {
        return prev.content === next.content;
    }

    return textPartsSignature(prev.textParts) === textPartsSignature(next.textParts);
});
