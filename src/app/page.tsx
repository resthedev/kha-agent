"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Terminal, Loader2, User, Bot, Cloud, Calculator } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Home() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

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
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    return (
        <main className="flex min-h-screen flex-col bg-[#1a1b26] text-[#c0caf5]">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-[#24283b]/30 bg-[#1a1b26]/70 backdrop-blur-xl px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#7aa2f7]/5 rounded-lg border border-[#7aa2f7]/5 shadow-sm">
                        <Bot className="w-6 h-6 text-[#7aa2f7]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] bg-clip-text text-transparent">
                            Agent Antigravity
                        </h1>
                        <p className="text-xs text-[#565f89]">Powered by Claude Haiku 4.5</p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 overflow-y-auto space-y-6 pb-32">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4"
                        >
                            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#24283b]/30 to-[#1a1b26]/30 border border-[#7aa2f7]/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] backdrop-blur-sm">
                                <Terminal className="w-12 h-12 text-[#7aa2f7] drop-shadow-[0_0_10px_rgba(122,162,247,0.1)]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#c0caf5]">Ready to help</h2>
                            <p className="text-[#565f89] max-w-md">
                                I can help you with calculations, check the weather, and more.
                                Just ask freely.
                            </p>
                        </motion.div>
                    )}

                    {messages.map((m, idx) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.2,
                                ease: [0.25, 0.1, 0.25, 1]
                            }}
                            layout={false}
                            style={{ willChange: "transform, opacity" }}
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
                                className={`flex flex-col max-w-[80%] space-y-2 ${m.role === "user" ? "items-end" : "items-start"
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
                                    {/* Render parts if available (for interleaved text/tools) */}
                                    {m.parts ? (
                                        m.parts.map((part, index) => {
                                            if (part.type === 'text') {
                                                return (
                                                    <div key={index} className="prose prose-invert prose-sm max-w-none mb-2 leading-relaxed">
                                                        <ReactMarkdown>{part.text}</ReactMarkdown>
                                                    </div>
                                                );
                                            }

                                            if (part.type === 'tool-invocation') {
                                                const toolInvocation = part.toolInvocation;
                                                const toolCallId = toolInvocation.toolCallId;
                                                const addResult = 'result' in toolInvocation;

                                                return (
                                                    <div
                                                        key={toolCallId}
                                                        style={{
                                                            transform: "translateZ(0)",
                                                            backfaceVisibility: "hidden"
                                                        }}
                                                        className="my-3 text-sm group"
                                                    >
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#16161e]/50 border border-[#ffffff]/5 backdrop-blur-md shadow-sm transition-all hover:bg-[#16161e]/80 hover:border-[#7aa2f7]/10">
                                                            {toolInvocation.toolName === 'weather' ? (
                                                                <Cloud className="w-4 h-4 text-[#7aa2f7] drop-shadow-[0_0_8px_rgba(122,162,247,0.15)]" />
                                                            ) : toolInvocation.toolName === 'calculator' ? (
                                                                <Calculator className="w-4 h-4 text-[#bb9af7] drop-shadow-[0_0_8px_rgba(187,154,247,0.15)]" />
                                                            ) : (
                                                                <Terminal className="w-4 h-4 text-[#565f89]" />
                                                            )}
                                                            <span className="font-mono text-[#7dcfff] group-hover:text-[#7aa2f7] transition-colors">
                                                                {toolInvocation.toolName}
                                                            </span>
                                                            <span className="text-[#565f89] text-xs uppercase tracking-wider">
                                                                {addResult ? 'completed' : 'running...'}
                                                            </span>
                                                        </div>
                                                        {addResult && (
                                                            <div
                                                                style={{
                                                                    transform: "translateZ(0)",
                                                                    backfaceVisibility: "hidden"
                                                                }}
                                                            >
                                                                <div className="mt-2 ml-3 pl-3 border-l border-[#2f3549]/30 text-xs font-mono text-[#9aa5ce] py-1">
                                                                    <span className="opacity-50 mr-2">➜</span>{JSON.stringify(toolInvocation.result)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })
                                    ) : (
                                        // Fallback for simple messages
                                        m.content && (
                                            <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                                                <ReactMarkdown>{m.content}</ReactMarkdown>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7aa2f7] shadow-sm shadow-[#7aa2f7]/5 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-[#1a1b26]" />
                            </div>
                            <div className="bg-gradient-to-br from-[#24283b]/80 to-[#1f2335]/80 border border-[#ffffff]/5 rounded-2xl px-6 py-4 shadow-sm backdrop-blur-sm">
                                <Loader2 className="w-5 h-5 animate-spin text-[#7aa2f7]" />
                            </div>
                        </motion.div>
                    )}
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
                            className="w-full bg-[#16161e]/50 border border-[#2f3549]/30 rounded-2xl pl-6 pr-14 py-5 text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:ring-1 focus:ring-[#7aa2f7]/20 focus:border-[#7aa2f7]/20 focus:bg-[#16161e]/80 transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] backdrop-blur-xl"
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
                    <div className="mt-4 text-center">
                        <p className="text-[10px] text-[#565f89] font-medium tracking-wide opacity-50">
                            AI Agent using Next.js, Tailwind, & Vercel AI SDK
                        </p>
                    </div>
                </div>
            </div>
        </main >
    );
}
