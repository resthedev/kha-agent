"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Terminal, Loader2, User, Bot, Cloud, Calculator, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const animatedMessageIds = useRef<Set<string>>(new Set());
    const animatedToolBubbles = useRef<Set<string>>(new Set());
    const animatedTextBubbles = useRef<Set<string>>(new Set());
    const animatedToolResults = useRef<Set<string>>(new Set());
    const animatedCheckmarks = useRef<Set<string>>(new Set());

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: "auto",
                    block: "end"
                });
            }
        });
    };

    // Scroll on message changes (including streaming updates)
    useLayoutEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Track tool results and checkmarks after render
        messages.forEach((m) => {
            const toolInvocations = m.parts?.filter(part => part.type === 'tool-invocation') || [];
            toolInvocations.forEach((part) => {
                if (part.type === 'tool-invocation') {
                    const toolCallId = part.toolInvocation.toolCallId;
                    const hasResult = 'result' in part.toolInvocation;
                    if (hasResult) {
                        // Mark as animated after a delay to allow animation to play
                        setTimeout(() => {
                            animatedToolResults.current.add(toolCallId);
                            animatedCheckmarks.current.add(toolCallId);
                        }, 500);
                    }
                }
            });
        });
    }, [messages]);

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    return (
        <main className="flex min-h-screen flex-col bg-[#1a1b26] text-[#c0caf5] tracking-[-0.02em]">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-[#24283b]/30 bg-[#1a1b26]/70 backdrop-blur-xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#7aa2f7]/5 rounded-lg border border-[#7aa2f7]/5 shadow-sm">
                        <Bot className="w-6 h-6 text-[#7aa2f7]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-normal bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] bg-clip-text text-transparent">
                            Kha's Agent
                        </h1>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 overflow-y-auto space-y-6 pb-32">
                <AnimatePresence initial={false} mode="popLayout">
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4"
                        >
                            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#24283b]/30 to-[#1a1b26]/30 border border-[#7aa2f7]/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] backdrop-blur-sm">
                                <Bot className="w-12 h-12 text-[#7aa2f7]" />
                            </div>
                            <h2 className="text-2xl font-semibold text-[#c0caf5]">Ready to help</h2>
                            <p className="text-[#565f89] max-w-md">
                                I can help you with calculations, check the weather, and more.
                                Just ask freely.
                            </p>
                        </motion.div>
                    )}

                    {messages.map((m, idx) => {
                        const hasAnimated = animatedMessageIds.current.has(m.id);
                        if (!hasAnimated) {
                            animatedMessageIds.current.add(m.id);
                        }

                        // Separate tool invocations from text
                        const toolInvocations = m.parts?.filter(part => part.type === 'tool-invocation') || [];
                        const textParts = m.parts?.filter(part => part.type === 'text') || [];
                        const hasText = textParts.length > 0 || m.content;
                        const hasTools = toolInvocations.length > 0;

                        // Check if there are incomplete tool invocations
                        const hasIncompleteTools = toolInvocations.some(part => {
                            if (part.type === 'tool-invocation') {
                                return !('result' in part.toolInvocation);
                            }
                            return false;
                        });

                        // Only show text if there are no tools running, or if tools are complete
                        const shouldShowText = hasText && (!hasTools || !hasIncompleteTools);

                        // Track tool and text bubble animations separately
                        const toolBubbleId = `${m.id}-tools`;
                        const textBubbleId = `${m.id}-text`;
                        const hasToolBubbleAnimated = animatedToolBubbles.current.has(toolBubbleId);
                        const hasTextBubbleAnimated = animatedTextBubbles.current.has(textBubbleId);

                        if (hasTools && !hasToolBubbleAnimated) {
                            animatedToolBubbles.current.add(toolBubbleId);
                        }
                        if (shouldShowText && !hasTextBubbleAnimated) {
                            animatedTextBubbles.current.add(textBubbleId);
                        }

                        return (
                            <div key={m.id} className="space-y-3">
                                {/* Render tool invocations in a chat bubble */}
                                {hasTools && (
                                    <motion.div
                                        key={toolBubbleId}
                                        initial={hasToolBubbleAnimated ? false : { opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            duration: 0.2,
                                            ease: [0.25, 0.1, 0.25, 1]
                                        }}
                                        layout={false}
                                        className="flex gap-4"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7aa2f7] shadow-sm shadow-[#7aa2f7]/5 flex items-center justify-center">
                                            <Bot className="w-5 h-5 text-[#1a1b26]" />
                                        </div>

                                        <div className="flex flex-col max-w-[80%]">
                                            <div
                                                style={{
                                                    contain: "layout style paint",
                                                    transform: "translateZ(0)"
                                                }}
                                                className={`rounded-2xl px-6 pt-0 shadow-sm overflow-hidden bg-gradient-to-br from-[#24283b]/80 to-[#1f2335]/80 border border-[#ffffff]/5 text-[#c0caf5] shadow-[0_0_15px_-3px_rgba(0,0,0,0.05)] ${hasIncompleteTools ? 'pb-0' : 'pb-3'}`}
                                            >
                                                <div className="space-y-0 -mx-6">
                                                    {toolInvocations.map((part, index) => {
                                                        if (part.type !== 'tool-invocation') return null;

                                                        const toolInvocation = part.toolInvocation;
                                                        const toolCallId = toolInvocation.toolCallId;
                                                        const addResult = 'result' in toolInvocation;

                                                        // Track if this specific tool result has been animated
                                                        const hasResultAnimated = animatedToolResults.current.has(toolCallId);
                                                        const hasCheckmarkAnimated = animatedCheckmarks.current.has(toolCallId);

                                                        return (
                                                            <div key={toolCallId} className="text-sm">
                                                                <div className="flex items-center gap-3 p-3 px-6 rounded-none bg-[#16161e]/50 border-t border-[#ffffff]/5 backdrop-blur-md transition-all hover:bg-[#16161e]/80">
                                                                    {toolInvocation.toolName === 'weather' ? (
                                                                        <Cloud className="w-4 h-4 text-[#7aa2f7] drop-shadow-[0_0_8px_rgba(122,162,247,0.15)]" />
                                                                    ) : toolInvocation.toolName === 'calculator' ? (
                                                                        <Calculator className="w-4 h-4 text-[#bb9af7] drop-shadow-[0_0_8px_rgba(187,154,247,0.15)]" />
                                                                    ) : (
                                                                        <Terminal className="w-4 h-4 text-[#565f89]" />
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-mono text-[#7dcfff] group-hover:text-[#7aa2f7] transition-colors">
                                                                            {toolInvocation.toolName}
                                                                        </div>
                                                                        {'args' in toolInvocation && (
                                                                            <div className="text-xs text-[#565f89] mt-1 flex flex-wrap gap-1.5 font-mono">
                                                                                {Object.entries(toolInvocation.args).map(([key, value]) => (
                                                                                    <span key={key} className="inline-flex items-center gap-1">
                                                                                        <span className="text-[#7aa2f7]/60">{key}:</span>
                                                                                        <span className="text-[#9aa5ce]">"{String(value)}"</span>
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {addResult ? (
                                                                        <div className="relative w-4 h-4 flex-shrink-0" key={`check-${toolCallId}`}>
                                                                            <Check className={`w-4 h-4 text-[#9ece6a] ${!hasCheckmarkAnimated ? 'checkmark-icon' : ''}`} strokeWidth={3} />
                                                                        </div>
                                                                    ) : (
                                                                        <Loader2 className="w-4 h-4 animate-spin text-[#7aa2f7] flex-shrink-0" />
                                                                    )}
                                                                </div>
                                                                {addResult && (
                                                                    <motion.div
                                                                        key={`result-${toolCallId}`}
                                                                        initial={hasResultAnimated ? false : { opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                                                        className="mt-2 text-xs font-mono text-[#9aa5ce] py-1 px-6"
                                                                    >
                                                                        <span className="opacity-50 mr-2">→</span>{JSON.stringify(toolInvocation.result)}
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Render text response in separate bubble */}
                                {shouldShowText && (
                                    <motion.div
                                        key={textBubbleId}
                                        initial={hasTextBubbleAnimated ? false : { opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            duration: 0.2,
                                            ease: [0.25, 0.1, 0.25, 1]
                                        }}
                                        layout={false}
                                        className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <div
                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${m.role === "user" ? "bg-[#bb9af7] shadow-[#bb9af7]/5" : "bg-[#7aa2f7] shadow-[#7aa2f7]/5"
                                                }`}
                                        >
                                            {m.role === "user" ? (
                                                <User className="w-5 h-5 text-[#1a1b26]" />
                                            ) : (
                                                <Bot className="w-5 h-5 text-[#1a1b26]" />
                                            )}
                                        </div>

                                        <div
                                            className={`flex flex-col max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"
                                                }`}
                                        >
                                            <div
                                                style={{
                                                    contain: "layout style paint",
                                                    transform: "translateZ(0)"
                                                }}
                                                className={`rounded-2xl px-6 py-4 shadow-sm overflow-hidden ${m.role === "user"
                                                    ? "bg-gradient-to-br from-[#bb9af7]/10 to-[#bb9af7]/5 border border-[#bb9af7]/5 text-[#c0caf5] shadow-[0_0_15px_-3px_rgba(187,154,247,0.02)]"
                                                    : "bg-gradient-to-br from-[#24283b]/80 to-[#1f2335]/80 border border-[#ffffff]/5 text-[#c0caf5] shadow-[0_0_15px_-3px_rgba(0,0,0,0.05)]"
                                                    }`}
                                            >
                                                {textParts.length > 0 ? (
                                                    textParts.map((part, index) => (
                                                        <div key={index} className="prose prose-invert prose-sm max-w-none leading-relaxed streaming-text [&>*:last-child]:mb-0 last:mb-0">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                                                        </div>
                                                    ))
                                                ) : (
                                                    m.content && (
                                                        <div className="prose prose-invert prose-sm max-w-none leading-relaxed streaming-text [&>*:last-child]:mb-0">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}

                </AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/5 text-red-200 text-sm flex items-center gap-2 backdrop-blur-sm shadow-sm"
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]" />
                        <span>Error: {error.message}</span>
                        <button
                            onClick={() => window.location.reload()}
                            className="ml-auto hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all text-xs font-medium uppercase tracking-wide"
                        >
                            Reload
                        </button>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-transparent p-4">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b26] via-[#1a1b26]/95 to-transparent pointer-events-none" />
                <div className="max-w-3xl mx-auto relative z-10">
                    <form onSubmit={handleSubmit} className="relative group">
                        <input
                            className="w-full bg-[#16161e]/50 border border-[#2f3549]/30 rounded-2xl pl-6 pr-14 py-5 text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7]/30 focus:bg-[#16161e]/80 transition-colors duration-200 ease-out shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] backdrop-blur-xl"
                            value={input}
                            placeholder="Type your message..."
                            onChange={handleInputChange}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-3 p-2.5 rounded-xl bg-gradient-to-br from-[#7aa2f7] to-[#6a92e7] hover:shadow-[0_0_15px_-3px_rgba(122,162,247,0.15)] text-[#15161e] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 ease-out"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </main >
    );
}
