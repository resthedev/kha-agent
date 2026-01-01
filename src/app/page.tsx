"use client";

import { useChat } from "ai/react";
import { AnimatePresence } from "framer-motion";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { EmptyState } from "@/components/chat/EmptyState";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { ErrorMessage } from "@/components/chat/ErrorMessage";
import { useAnimationTracking } from "@/hooks/useAnimationTracking";
import { useAutoScroll } from "@/hooks/useAutoScroll";

export default function Home() {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat();

    const { messagesEndRef } = useAutoScroll(messages);
    const {
        animatedMessageIds,
        animatedToolBubbles,
        animatedTextBubbles,
        animatedToolResults,
        animatedCheckmarks,
    } = useAnimationTracking(messages);

    return (
        <main className="flex min-h-screen flex-col bg-[#1a1b26] text-[#c0caf5]">
            <ChatHeader />

            <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 overflow-y-auto space-y-6 pb-32 scroll-smooth">
                {messages.length === 0 ? (
                    <AnimatePresence initial={false} mode="popLayout">
                        <EmptyState key="empty-state" />
                    </AnimatePresence>
                ) : (
                    <MessageList
                        messages={messages}
                        animatedMessageIds={animatedMessageIds}
                        animatedToolBubbles={animatedToolBubbles}
                        animatedTextBubbles={animatedTextBubbles}
                        animatedToolResults={animatedToolResults}
                        animatedCheckmarks={animatedCheckmarks}
                    />
                )}

                {error && <ErrorMessage message={error.message} />}
                <div ref={messagesEndRef} className="h-32" />
            </div>

            <ChatInput
                input={input}
                isLoading={isLoading}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
            />
        </main>
    );
}
